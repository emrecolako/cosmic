"use client";
import { useRef } from 'react';
import { useI18n } from './LocaleProvider';
import { atlasCopy } from '@/lib/i18n/atlas';
import { trackShare, useSharerRef } from '@/lib/analytics';
import type { SharePlacement } from '@/lib/share';
import type { ResultCardSize } from '@/lib/result-card';
import { useToast } from './ui/Toast';
import Button from './ui/Button';

const labels = {
  en: { open: 'Save / share card', story: 'Story 9:16', square: 'Square 1:1', note: 'Only your Life Path number goes on the card, with the site address. No name or birth date.' },
  tr: { open: 'Kartı kaydet / paylaş', story: 'Hikâye 9:16', square: 'Kare 1:1', note: 'Kartta yalnızca Yaşam Yolu sayın ve site adresi yer alır. Ad veya doğum tarihi yok.' },
  es: { open: 'Guardar / compartir tarjeta', story: 'Historia 9:16', square: 'Cuadrada 1:1', note: 'La tarjeta solo lleva tu número de Camino de Vida y la dirección del sitio. Sin nombre ni fecha de nacimiento.' },
  fr: { open: 'Enregistrer / partager la carte', story: 'Story 9:16', square: 'Carré 1:1', note: 'La carte ne montre que votre Chemin de Vie et l’adresse du site. Ni nom ni date de naissance.' },
  de: { open: 'Karte speichern / teilen', story: 'Story 9:16', square: 'Quadrat 1:1', note: 'Die Karte zeigt nur deine Lebenswegzahl und die Website. Kein Name, kein Geburtsdatum.' },
  pt: { open: 'Salvar / compartilhar cartão', story: 'Story 9:16', square: 'Quadrado 1:1', note: 'O cartão mostra apenas seu número do Caminho de Vida e o endereço do site. Sem nome nem data de nascimento.' },
  it: { open: 'Salva / condividi la card', story: 'Storia 9:16', square: 'Quadrata 1:1', note: 'La card mostra solo il tuo numero del Percorso di Vita e l’indirizzo del sito. Nessun nome né data di nascita.' },
};
const SIZES: ResultCardSize[] = ['story', 'square'];
const cardUrl = (number: number, size: ResultCardSize) => `/api/card?t=lp&v=${number}&s=${size}`;

/**
 * The screenshot-ready Life Path card. Phones get the image file through the
 * Web Share API; everything else downloads it. Images are fetched when the
 * dialog opens so share() runs inside the tap, as iOS Safari requires.
 */
export default function ResultCardShare({ lifePath, placement }: { lifePath: number; placement: SharePlacement }) {
  const { locale, t } = useI18n();
  const copy = labels[locale];
  const dialog = useRef<HTMLDialogElement>(null);
  const files = useRef<Partial<Record<ResultCardSize, Promise<File>>>>({});
  const ready = useRef<Partial<Record<ResultCardSize, File>>>({});
  const { toast } = useToast();
  const sharerRef = useSharerRef();

  const load = (size: ResultCardSize) => (files.current[size] ??= fetch(cardUrl(lifePath, size))
    .then((response) => { if (!response.ok) throw new Error(`card ${response.status}`); return response.blob(); })
    .then((blob) => (ready.current[size] = new File([blob], `unified-reading-life-path-${lifePath}-${size}.png`, { type: 'image/png' })))
    .catch((error) => { delete files.current[size]; throw error; }));

  const open = () => { SIZES.forEach((size) => void load(size).catch(() => {})); dialog.current?.showModal(); };

  const download = (file: File, size: ResultCardSize) => {
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = file.name;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    trackShare('result_card', 'download', sharerRef, { surface: placement, card_size: size });
  };

  const save = async (size: ResultCardSize) => {
    try {
      const file = ready.current[size] ?? await load(size);
      const mobile = window.matchMedia('(pointer: coarse)').matches;
      if (!mobile || !navigator.canShare?.({ files: [file] })) return download(file, size);
      try {
        await navigator.share({ files: [file], title: 'Unified Reading' });
        trackShare('result_card', 'native', sharerRef, { surface: placement, card_size: size });
      } catch (error) {
        const name = (error as DOMException)?.name;
        if (name === 'AbortError') return;
        // The tap's activation can lapse while a slow image loads; saving it still works.
        if (name === 'NotAllowedError') return download(file, size);
        throw error;
      }
    } catch { toast(t.header.shareFailed, 'error'); }
  };

  return <>
    <button className="atlas-link" onClick={open} data-attr="result-card-open">{copy.open} ↓</button>
    <dialog ref={dialog} className="share-dialog" aria-labelledby="result-card-title">
      <div className="flex items-center justify-between gap-4"><h2 id="result-card-title" className="text-xl">{copy.open}</h2><button className="min-h-11 px-2" onClick={() => dialog.current?.close()} aria-label={atlasCopy[locale].close}>✕</button></div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="result-card-preview" src={cardUrl(lifePath, 'story')} width={1080} height={1920} alt="" />
      <p className="text-sm text-ink-muted leading-relaxed mb-6">{copy.note}</p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => save('story')} data-attr="result-card-story">{copy.story} ↓</Button>
        <Button variant="outline" onClick={() => save('square')} data-attr="result-card-square">{copy.square} ↓</Button>
      </div>
    </dialog>
  </>;
}
