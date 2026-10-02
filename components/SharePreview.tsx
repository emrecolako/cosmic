"use client";
import { useRef } from 'react';
import { useI18n } from './LocaleProvider';
import { atlasCopy } from '@/lib/i18n/atlas';
import { useToast } from './ui/Toast';
import FortuneCards from './FortuneCards';
import Button from './ui/Button';

/** Only allowlisted calculated markers enter the share payload, never AI prose or input. */
export default function SharePreview({ markers }: { markers: string[] }) {
  const { locale, t } = useI18n();
  const copy = atlasCopy[locale];
  const dialog = useRef<HTMLDialogElement>(null);
  const { toast } = useToast();
  const share = async () => {
    try {
      await navigator.clipboard.writeText(`Cosmic Blueprint\n${markers.join(' · ')}\n${window.location.origin}`);
      toast(t.header.shareCopied, 'success');
    } catch { toast(t.header.shareFailed, 'error'); }
  };
  return <>
    <button className="atlas-link" onClick={() => dialog.current?.showModal()}>{copy.sharePreview} ↗</button>
    <dialog ref={dialog} className="share-dialog" aria-labelledby="share-title">
      <div className="flex items-center justify-between gap-4"><h2 id="share-title" className="text-xl">{copy.sharePreview}</h2><button className="min-h-11 px-2" onClick={() => dialog.current?.close()} aria-label={copy.close}>✕</button></div>
      <div className="share-preview"><FortuneCards labels={[markers[0], markers[1], markers[2]]} number={Number(markers[0].match(/\d+/)?.[0]) || 7} /><p className="eyebrow">Cosmic Blueprint</p><p className="editorial text-3xl mt-4 leading-relaxed">{markers.join(' · ')}</p></div>
      <p className="text-sm text-ink-muted leading-relaxed mb-6">{copy.sharePrivacy}</p>
      <Button onClick={share}>{copy.copy}</Button>
    </dialog>
  </>;
}
