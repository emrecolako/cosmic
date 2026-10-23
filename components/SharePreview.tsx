"use client";
import { useEffect, useRef, useState } from 'react';
import { useI18n } from './LocaleProvider';
import { atlasCopy } from '@/lib/i18n/atlas';
import { trackShare } from '@/lib/analytics';
import { shareUrl, type SharePlacement } from '@/lib/share';
import { useToast } from './ui/Toast';
import FortuneCards from './FortuneCards';
import Button from './ui/Button';

/** Only allowlisted calculated markers enter the share payload, never AI prose or input. */
export default function SharePreview({ markers, placement }: { markers: string[]; placement: SharePlacement }) {
  const { locale, t } = useI18n();
  const copy = atlasCopy[locale];
  const dialog = useRef<HTMLDialogElement>(null);
  const { toast } = useToast();
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(typeof navigator.share === 'function'), []);
  const summary = `Unified Reading\n${markers.join(' · ')}`;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${summary}\n${shareUrl('copy')}`);
      trackShare(placement, 'copy');
      toast(t.header.shareCopied, 'success');
    } catch { toast(t.header.shareFailed, 'error'); }
  };
  const nativeShare = async () => {
    try {
      await navigator.share({ title: 'Unified Reading', text: summary, url: shareUrl('native') });
      trackShare(placement, 'native');
    } catch (error) {
      if ((error as DOMException)?.name !== 'AbortError') toast(t.header.shareFailed, 'error');
    }
  };
  return <>
    <button className="atlas-link" onClick={() => dialog.current?.showModal()} data-attr="share-preview">{copy.sharePreview} ↗</button>
    <dialog ref={dialog} className="share-dialog" aria-labelledby="share-title">
      <div className="flex items-center justify-between gap-4"><h2 id="share-title" className="text-xl">{copy.sharePreview}</h2><button className="min-h-11 px-2" onClick={() => dialog.current?.close()} aria-label={copy.close}>✕</button></div>
      <div className="share-preview"><FortuneCards labels={[markers[0], markers[1], markers[2]]} number={Number(markers[0].match(/\d+/)?.[0]) || 7} /><p className="eyebrow">Unified Reading</p><p className="editorial text-3xl mt-4 leading-relaxed">{markers.join(' · ')}</p></div>
      <p className="text-sm text-ink-muted leading-relaxed mb-6">{copy.sharePrivacy}</p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={copyLink} data-attr="share-copy-link">{copy.copy}</Button>
        {canShare && <Button variant="outline" onClick={nativeShare} data-attr="share-native">{t.header.share} ↗</Button>}
      </div>
    </dialog>
  </>;
}
