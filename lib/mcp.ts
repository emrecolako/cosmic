import { calculateLifePath, getInterpretation } from "@/lib/numerology";
import { getSunSign } from "@/lib/western-astrology";
import { getChineseZodiac } from "@/lib/chinese-zodiac";
import { chineseEntry, lifePathEntry } from "@/lib/library/registry";
import { priceLabel } from "@/lib/stripe";
import { SITE_URL } from "@/lib/site";

/**
 * A stateless MCP server (Streamable HTTP, JSON responses only) with one
 * MCP Apps view. Nothing is stored or logged: a birth date sent to
 * calculate_birth_date_profile lives only for the request, the same
 * calculation the public calculator pages run in the browser.
 */

export const PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
const PROFILE_VIEW_URI = "ui://unified-reading/birth-date-profile.html";
const APP_MIME_TYPE = "text/html;profile=mcp-app";

type JsonRpcRequest = { jsonrpc: "2.0"; id?: string | number | null; method: string; params?: Record<string, unknown> };
type JsonRpcResponse = { jsonrpc: "2.0"; id: string | number | null; result?: unknown; error?: { code: number; message: string } };

const TOOLS = [
  {
    name: "get_unified_reading_options",
    title: "Unified Reading options",
    description: "List what Unified Reading offers (free sample, free preview, paid full reading), its price, and the pages a person should open. Collects no personal data.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "calculate_birth_date_profile",
    title: "Birth date profile",
    description: "Calculate the Life Path number, Western Sun sign and Chinese zodiac animal for a birth date, with links to the matching Unified Reading library guides. Only the date is needed; never send names, birth times or places. Nothing is stored. Moon, rising, houses and the full combined reading need the website form.",
    inputSchema: {
      type: "object",
      properties: { date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$", description: "Birth date as YYYY-MM-DD (1900 or later, not in the future)." } },
      required: ["date"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
    _meta: { ui: { resourceUri: PROFILE_VIEW_URI } },
  },
];

function parseDate(value: unknown): Date | null {
  const match = typeof value === "string" ? value.match(/^(\d{4})-(\d{2})-(\d{2})$/) : null;
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  if (year < 1900 || date > new Date()) return null;
  return date;
}

function textResult(structuredContent: Record<string, unknown>, isError = false) {
  return { content: [{ type: "text", text: JSON.stringify(structuredContent) }], structuredContent, isError };
}

function readingOptions() {
  return textResult({
    sample: { url: `${SITE_URL}/sample`, price: "Free", note: "Fictional full report, no personal data." },
    preview: { url: `${SITE_URL}/#details`, price: "Free", note: "Calculated profile plus an AI snapshot. The person enters their own details." },
    fullReading: { url: `${SITE_URL}/pricing`, price: priceLabel(), note: "One-time Stripe Checkout payment, no account or subscription." },
    privacy: `${SITE_URL}/privacy`,
    library: `${SITE_URL}/library`,
    disclaimer: "An interpretive reflection, not a scientific assessment or prediction.",
  });
}

function birthDateProfile(args: Record<string, unknown>) {
  const date = parseDate(args.date);
  if (!date) return textResult({ error: "date must be a real YYYY-MM-DD date from 1900 up to today." }, true);

  const lifePath = calculateLifePath(date);
  const meaning = getInterpretation("lifePath", lifePath);
  const sun = getSunSign(date);
  const chinese = getChineseZodiac(date);
  return textResult({
    lifePath: { number: lifePath, title: meaning.title, brief: meaning.brief, keywords: meaning.keywords, guide: `${SITE_URL}${lifePathEntry(lifePath).path}` },
    sunSign: { sign: sun.sign, glyph: sun.glyph, decan: sun.decan, element: sun.element, modality: sun.modality, rulingPlanet: sun.rulingPlanet, guide: `${SITE_URL}/zodiac` },
    chineseZodiac: { animal: chinese.animal, element: chinese.element, yinYang: chinese.yinYang, bestWith: chinese.compatibility.bestWith, guide: `${SITE_URL}${chineseEntry(chinese.animal).path}` },
    notes: [
      "The Sun sign assumes midday; a birth on a sign change day may fall in the neighbouring sign depending on the birth time.",
      "The Chinese animal follows the Lunar New Year date for the birth year, not January 1.",
    ],
    fullReading: `${SITE_URL}/#details`,
  });
}

function profileViewHtml(): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
:root{--bg:#fff;--panel:#f4f4f5;--text:#000;--muted:#52525b;--line:#d4d4d8;color-scheme:light}
:root[data-theme=dark]{--bg:#000;--panel:#18181b;--text:#fff;--muted:#a1a1aa;--line:#3f3f46;color-scheme:dark}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:14px/1.5 "IBM Plex Sans",system-ui,sans-serif}
main{padding:16px;display:grid;gap:12px}.label{font:12px "IBM Plex Mono",ui-monospace,monospace;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px}.card{background:var(--panel);border-radius:8px;padding:12px}
.value{font:500 22px "IBM Plex Mono",ui-monospace,monospace;font-variant-numeric:tabular-nums;margin:4px 0}p{margin:4px 0;color:var(--muted)}
a{color:var(--text)}.cta{display:inline-block;background:var(--text);color:var(--bg);padding:8px 12px;border-radius:6px;font:12px "IBM Plex Mono",ui-monospace,monospace;text-transform:uppercase;text-decoration:none}
</style></head><body><main id="root"><div class="label">[UNIFIED READING] Loading profile…</div></main><script>
(function(){
var root=document.getElementById("root"),nextId=1,pending={};
function send(msg){window.parent.postMessage(msg,"*")}
function request(method,params){var id=nextId++;send({jsonrpc:"2.0",id:id,method:method,params:params});return new Promise(function(r){pending[id]=r})}
function notify(method,params){send({jsonrpc:"2.0",method:method,params:params||{}})}
function theme(ctx){if(ctx&&ctx.theme)document.documentElement.dataset.theme=ctx.theme}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function link(url,label){return '<a href="'+esc(url)+'" target="_blank" rel="noopener">'+esc(label)+'</a>'}
function resize(){notify("ui/notifications/size-changed",{width:document.body.scrollWidth,height:document.body.scrollHeight})}
function render(result){
  var d=result&&result.structuredContent;
  if(!d||d.error||!d.lifePath){root.innerHTML='<div class="label">ERROR: '+esc(d&&d.error||"No profile returned.")+'</div>';return resize()}
  root.innerHTML='<div class="label">[UNIFIED READING] Birth date profile</div><div class="grid">'
   +'<div class="card"><div class="label">Life Path</div><div class="value">'+esc(d.lifePath.number)+'</div><p>'+esc(d.lifePath.title)+'</p>'+link(d.lifePath.guide,"Guide ↗")+'</div>'
   +'<div class="card"><div class="label">Sun sign</div><div class="value">'+esc(d.sunSign.glyph)+' '+esc(d.sunSign.sign)+'</div><p>Decan '+esc(d.sunSign.decan)+' · '+esc(d.sunSign.element)+' · '+esc(d.sunSign.modality)+'</p>'+link(d.sunSign.guide,"Guide ↗")+'</div>'
   +'<div class="card"><div class="label">Chinese zodiac</div><div class="value">'+esc(d.chineseZodiac.animal)+'</div><p>'+esc(d.chineseZodiac.yinYang)+' '+esc(d.chineseZodiac.element)+'</p>'+link(d.chineseZodiac.guide,"Guide ↗")+'</div>'
   +'</div><p>'+esc(d.lifePath.brief)+'</p><div><a class="cta" href="'+esc(d.fullReading)+'" target="_blank" rel="noopener">Get the combined reading ↗</a></div>';
  resize();
}
// Sandboxed hosts block iframe popups, so links open through the host.
document.addEventListener("click",function(e){
  var a=e.target.closest&&e.target.closest("a[href]");if(!a)return;
  e.preventDefault();
  request("ui/open-link",{url:a.href}).then(function(m){if(m.error)window.open(a.href,"_blank","noopener")});
});
window.addEventListener("message",function(e){
  var m=e.data;if(!m||m.jsonrpc!=="2.0")return;
  if(m.id!=null&&pending[m.id]){pending[m.id](m);delete pending[m.id];return}
  if(m.method==="ui/notifications/tool-result")render(m.params);
  else if(m.method==="ui/notifications/host-context-changed")theme(m.params);
});
request("ui/initialize",{protocolVersion:"2026-01-26",clientInfo:{name:"unified-reading-profile",version:"1.0.0"},appCapabilities:{}}).then(function(m){var r=m.result;theme(r&&r.hostContext);notify("ui/notifications/initialized")});
})();
</script></body></html>`;
}

const RESOURCES = [
  {
    uri: PROFILE_VIEW_URI,
    name: "birth-date-profile",
    title: "Birth date profile card",
    description: "Interactive card showing the Life Path number, Sun sign and Chinese zodiac animal returned by calculate_birth_date_profile.",
    mimeType: APP_MIME_TYPE,
  },
];

function handle(message: JsonRpcRequest): JsonRpcResponse | null {
  const id = message.id ?? null;
  const ok = (result: unknown): JsonRpcResponse => ({ jsonrpc: "2.0", id, result });
  const fail = (code: number, text: string): JsonRpcResponse => ({ jsonrpc: "2.0", id, error: { code, message: text } });
  // Notifications (no id) get no response.
  if (message.id === undefined) return null;

  switch (message.method) {
    case "initialize": {
      const requested = String(message.params?.protocolVersion ?? "");
      return ok({
        protocolVersion: PROTOCOL_VERSIONS.includes(requested) ? requested : PROTOCOL_VERSIONS[0],
        capabilities: {
          tools: { listChanged: false },
          resources: { listChanged: false },
          extensions: { "io.modelcontextprotocol/ui": { mimeTypes: [APP_MIME_TYPE] } },
        },
        serverInfo: { name: "unified-reading", title: "Unified Reading", version: "1.0.0", websiteUrl: `${SITE_URL}/` },
        instructions: "Unified Reading combines numerology, Western astrology and the Chinese zodiac into one reflective reading. Use calculate_birth_date_profile for date-only facts; send people to the website form for a personal reading and never collect their name, birth time or place here.",
      });
    }
    case "ping":
      return ok({});
    case "tools/list":
      return ok({ tools: TOOLS });
    case "tools/call": {
      const name = message.params?.name;
      const args = (message.params?.arguments ?? {}) as Record<string, unknown>;
      if (name === "get_unified_reading_options") return ok(readingOptions());
      if (name === "calculate_birth_date_profile") return ok(birthDateProfile(args));
      return fail(-32602, `Unknown tool: ${String(name)}`);
    }
    case "resources/list":
      return ok({ resources: RESOURCES });
    case "resources/templates/list":
      return ok({ resourceTemplates: [] });
    case "resources/read": {
      if (message.params?.uri !== PROFILE_VIEW_URI) return fail(-32002, "Resource not found");
      return ok({
        contents: [{
          uri: PROFILE_VIEW_URI,
          mimeType: APP_MIME_TYPE,
          text: profileViewHtml(),
          _meta: { ui: { prefersBorder: true, csp: { connectDomains: [], resourceDomains: [] } } },
        }],
      });
    }
    default:
      return fail(-32601, `Method not found: ${message.method}`);
  }
}

/** Handles one JSON-RPC message or a batch; null means "202, nothing to send". */
export function handleMcp(body: unknown): JsonRpcResponse | JsonRpcResponse[] | null {
  const invalid = (): JsonRpcResponse => ({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid Request" } });
  const one = (m: unknown) =>
    m && typeof m === "object" && (m as JsonRpcRequest).jsonrpc === "2.0" && typeof (m as JsonRpcRequest).method === "string"
      ? handle(m as JsonRpcRequest)
      : invalid();
  if (Array.isArray(body)) {
    const responses = body.map(one).filter((r): r is JsonRpcResponse => r !== null);
    return responses.length ? responses : null;
  }
  return one(body);
}
