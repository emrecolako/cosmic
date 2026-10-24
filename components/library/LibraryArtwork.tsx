import Image from "next/image";
import type { LibraryEntry } from "@/lib/library/registry";

const animalArt = (animal: string) => animal === "Horse" ? "chinese-zodiac-horse" : `zodiac-${animal.toLowerCase()}`;
const image = (name: string, alt: string, className = "", extension = "png") => <Image
  className={`library-artwork-image ${className}`}
  src={`/artwork/${name}.${extension}`}
  alt={alt}
  width={1254}
  height={1254}
  sizes="(max-width: 720px) 132px, 220px"
/>;

/** The art follows the subject of the entry rather than its URL position. */
export default function LibraryArtwork({ entry }: { entry: LibraryEntry }) {
  if (entry.type === "chinese-zodiac") {
    const animal = entry.label;
    return <figure className="library-artwork library-artwork-single">
      {image(animalArt(animal), `Archival illustration of ${animal === "Ox" ? "an" : "a"} ${animal}`)}
      <figcaption>{animal} · Chinese zodiac</figcaption>
    </figure>;
  }

  if (entry.type === "chinese-zodiac-pair") {
    const [first, second] = entry.slug.split("-and-").map((part) => part[0].toUpperCase() + part.slice(1));
    return <figure className="library-artwork library-artwork-pair">
      {image(animalArt(first), `Archival illustration of ${first === "Ox" ? "an" : "a"} ${first}`)}
      <span className="library-artwork-divider" aria-hidden="true">&</span>
      {image(animalArt(second), `Archival illustration of ${second === "Ox" ? "an" : "a"} ${second}`)}
      <figcaption>{first} & {second}</figcaption>
    </figure>;
  }

  if (entry.type === "zodiac-pair") {
    const [first, second] = entry.slug.split("-and-").map((part) => part[0].toUpperCase() + part.slice(1));
    return <figure className="library-artwork library-artwork-pair">
      {image(`western-${first.toLowerCase()}`, `Archival illustration of ${first}, the Western zodiac sign`, "", "webp")}
      <span className="library-artwork-divider" aria-hidden="true">&</span>
      {image(`western-${second.toLowerCase()}`, `Archival illustration of ${second}, the Western zodiac sign`, "", "webp")}
      <figcaption>{first} & {second}</figcaption>
    </figure>;
  }

  if (entry.type === "life-path" || entry.type === "life-path-pair") {
    const numbers = entry.type === "life-path-pair" ? entry.slug.split("-vs-").join(" & ") : entry.slug;
    return <figure className="library-artwork library-artwork-numbers">
      <span className="library-artwork-number" aria-hidden="true">{numbers}</span>
      {image("numbers-abacus", "Archival illustration of an abacus")}
      <figcaption>Life Path {numbers}</figcaption>
    </figure>;
  }

  // The library hub and pages that combine traditions (birthdays, cross-system pages) show all three.
  if (entry.slug === "library" || entry.system === "mixed") {
    return <figure className="library-artwork library-artwork-overview">
      {image("numbers-abacus", "Abacus for numerology")}
      {image("zodiac-armillary", "Armillary instrument for Western astrology")}
      {image("chinese-zodiac-horse", "Horse sculpture for the Chinese zodiac")}
      <figcaption>Three traditions, one reading</figcaption>
    </figure>;
  }

  const western = entry.system === "western";
  const chinese = entry.system === "chinese";
  const artwork = western ? "zodiac-armillary" : chinese ? "chinese-zodiac-horse" : "numbers-abacus";
  const subject = western ? "Armillary instrument" : chinese ? "Horse sculpture" : "Abacus";
  return <figure className="library-artwork library-artwork-single">
    {image(artwork, `Archival illustration of ${western || entry.system === "numerology" ? "an" : "a"} ${subject.toLowerCase()}`)}
    <figcaption>{entry.system === "numerology" ? "Numerology" : western ? "Western astrology" : "Chinese zodiac"}</figcaption>
  </figure>;
}
