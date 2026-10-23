const HTML_404 = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | Unified Reading</title><style>body{margin:0;font:17px/1.6 system-ui,sans-serif;background:#f7f7f7;color:#575657}main{max-width:640px;margin:15vh auto;padding:0 24px}h1{font:500 40px/1.1 Georgia,serif;margin:0 0 20px}a{color:inherit}@media(prefers-color-scheme:dark){body{background:#121212;color:#f7f7f7}}</style></head><body><main><h1>That page is not here.</h1><p>Try the <a href="/">homepage</a>, the <a href="/sample">sample reading</a>, the <a href="/library">library</a> or the <a href="/about">method</a>.</p></main></body></html>`;

/**
 * Catches every URL no page or prerendered library param matches. A route
 * handler's notFound() sends an empty body, so both formats are written out.
 */
export function GET(request: Request) {
  if (request.headers.get("accept")?.includes("text/markdown")) {
    return new Response(
      "# Page not found\n\nThe requested Unified Reading page does not exist. Start at https://unifiedreading.com/ or read the public page index at https://unifiedreading.com/llms.txt.\n",
      { status: 404, headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "no-store" } },
    );
  }
  return new Response(HTML_404, { status: 404, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
