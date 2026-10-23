import Image from 'next/image';
import type { AnimalName } from '@/lib/i18n/content';

export type ArtworkName =
  | 'numbers-abacus' | 'zodiac-armillary' | 'chinese-zodiac-horse' | 'chapters-book'
  | 'zodiac-rat' | 'zodiac-ox' | 'zodiac-tiger' | 'zodiac-rabbit' | 'zodiac-dragon'
  | 'zodiac-snake' | 'zodiac-goat' | 'zodiac-monkey' | 'zodiac-rooster'
  | 'zodiac-dog' | 'zodiac-pig';

const animalFiles: Record<AnimalName, ArtworkName> = {
  Rat: 'zodiac-rat', Ox: 'zodiac-ox', Tiger: 'zodiac-tiger', Rabbit: 'zodiac-rabbit',
  Dragon: 'zodiac-dragon', Snake: 'zodiac-snake', Horse: 'chinese-zodiac-horse',
  Goat: 'zodiac-goat', Monkey: 'zodiac-monkey', Rooster: 'zodiac-rooster',
  Dog: 'zodiac-dog', Pig: 'zodiac-pig',
};
export function animalArtwork(animal: AnimalName): ArtworkName { return animalFiles[animal]; }

export default function ReadingArtwork({ name, className = '', priority = false }: { name: ArtworkName; className?: string; priority?: boolean }) {
  return <Image className={`reading-artwork ${className}`} src={`/artwork/${name}.png`} alt="" width={1254} height={1254} sizes="(max-width: 640px) 240px, 330px" priority={priority} />;
}
