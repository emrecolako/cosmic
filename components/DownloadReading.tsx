"use client";
import type { CalculatedProfile } from '@/lib/profile';
import type { ParsedAnalysis } from '@/lib/analysis-stream';
import { useI18n } from './LocaleProvider';
import { useToast } from './ui/Toast';

const labels = { en:'Download reading', tr:'Okumayı indir', es:'Descargar lectura', fr:'Télécharger la lecture', de:'Deutung herunterladen', pt:'Baixar leitura', it:'Scarica la lettura' };
/** Plain text remains readable offline and never executes generated model content. */
export default function DownloadReading({ profile, ai, name, markers, complete }: { profile: CalculatedProfile; ai: ParsedAnalysis; name: string; markers: string[]; complete: boolean }) {
  const { locale, t } = useI18n();
  const { toast } = useToast();
  function download() {
    const text = [
      'Unified Reading', name, new Date().toISOString().slice(0,10),
      markers.join(' · '),
      `${t.numerology.lifePath}: ${profile.numerology.lifePath.number}`,
      `${t.numerology.expression}: ${profile.numerology.expression.number}`,
      `${t.numerology.soulUrge}: ${profile.numerology.soulUrge.number}`,
      `${t.numerology.personality}: ${profile.numerology.personality.number}`,
      `${t.numerology.personalYear} (${profile.currentYear}): ${profile.numerology.personalYear.number}`,
      t.results.cosmicSnapshotLabel, ai.cosmicSnapshot || '',
      t.sections.unifiedReadingTitle, ai.combinedAnalysis || '',
      t.sections.currentSeasonTitle, ai.currentSeason || '',
      t.sections.cosmicToolkitTitle, ...(ai.cosmicToolkit || []).map((item, index) => `${index+1}. ${item}`),
      'https://cosmic-jet.vercel.app/privacy',
    ].join('\n\n');
    const url = URL.createObjectURL(new Blob([text], { type:'text/plain;charset=utf-8' }));
    try {
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = `unified-reading-${profile.currentYear}.txt`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
    } catch { toast(t.header.shareFailed, 'error'); }
    finally { setTimeout(() => URL.revokeObjectURL(url), 1000); }
  }
  return <button className="atlas-link disabled:opacity-40" disabled={!complete} onClick={download}>{labels[locale]} ↓</button>;
}
