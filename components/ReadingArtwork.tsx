import Image from 'next/image';

export type ArtworkName = 'numbers-abacus' | 'zodiac-armillary' | 'chinese-zodiac-horse' | 'chapters-book';
export default function ReadingArtwork({ name, className = '', priority = false }: { name: ArtworkName; className?: string; priority?: boolean }) {
  return <Image className={`reading-artwork ${className}`} src={`/artwork/${name}.png`} alt="" width={1254} height={1254} sizes="(max-width: 640px) 240px, 330px" priority={priority} />;
}
