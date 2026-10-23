import ReadingArtwork, { type ArtworkName } from './ReadingArtwork';
/** The three lenses of the reading, using the original monochrome artwork. */
export default function FortuneCards({ labels, number = 7, sunGlyph, animalArt, interactive = false }: { labels: [string, string, string]; number?: number; sunGlyph: string; animalArt: ArtworkName; interactive?: boolean }) {
  const targets = ['numbers', 'star-map', 'eastern-mirror'];
  return <div className="profile-lenses">{labels.map((label, index) => {
    const art = <>{index === 0 ? <span className="profile-number" aria-hidden="true">{number}</span> : index === 1 ? <span className="profile-sun-glyph" aria-hidden="true">{sunGlyph}{'\uFE0E'}</span> : <ReadingArtwork name={animalArt} />}<span>{label}</span>{interactive && <span className="lens-arrow" aria-hidden="true">↗</span>}</>;
    return interactive ? <a key={label} href={`#${targets[index]}`}>{art}</a> : <div key={label}>{art}</div>;
  })}</div>;
}
