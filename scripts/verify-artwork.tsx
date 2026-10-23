import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import FortuneCards from '../components/FortuneCards';
import LibraryArtwork from '../components/library/LibraryArtwork';
import { animalArtwork, type ArtworkName } from '../components/ReadingArtwork';
import { computeProfile, type ReadingInput } from '../lib/profile';
import type { AnimalName } from '../lib/i18n/content';
import { ALL_ENTRIES } from '../lib/library/registry';

const animals: AnimalName[] = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig',
];
const chapterArt: ArtworkName[] = [
  'numbers-abacus', 'zodiac-armillary', 'chapters-book',
];

function assertPng(name: ArtworkName) {
  const file = readFileSync(join(process.cwd(), 'public', 'artwork', `${name}.png`));
  assert.ok(file.length > 100_000, `${name} is unexpectedly small`);
  assert.equal(file.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${name} is not a PNG`);
}

for (const name of chapterArt) assertPng(name);
for (const animal of animals) assertPng(animalArtwork(animal));

const cases: Array<{ input: ReadingInput; expectedAnimal: AnimalName }> = [
  { input: { fullName: 'Alex Morgan', dateOfBirth: '1990-11-04', lifeStages: ['building_career'] }, expectedAnimal: 'Horse' },
  { input: { fullName: 'River Lee', dateOfBirth: '2000-02-04', lifeStages: ['exploring'] }, expectedAnimal: 'Rabbit' },
  { input: { fullName: 'River Lee', dateOfBirth: '2000-02-05', birthTime: '09:30', lifeStages: ['exploring'] }, expectedAnimal: 'Dragon' },
  { input: { fullName: 'Taylor Chen', dateOfBirth: '2024-02-09', lifeStages: ['exploring'] }, expectedAnimal: 'Rabbit' },
  { input: { fullName: 'Taylor Chen', dateOfBirth: '2024-02-10', lifeStages: ['exploring'] }, expectedAnimal: 'Dragon' },
];

async function main() {
  for (const entry of ALL_ENTRIES) {
    const html = renderToStaticMarkup(<LibraryArtwork entry={entry} />);
    const names = [...html.matchAll(/%2Fartwork%2F([^&]+)\.png/g)].map((match) => match[1]);
    assert.ok(names.length > 0, `No artwork on ${entry.path}`);
    for (const name of names) assertPng(name as ArtworkName);
    if (entry.type === 'chinese-zodiac') assert.ok(names.includes(animalArtwork(entry.label as AnimalName)), `Wrong animal on ${entry.path}`);
    if (entry.type === 'chinese-zodiac-pair') {
      for (const animal of entry.slug.split('-and-')) {
        const expected = animalArtwork((animal[0].toUpperCase() + animal.slice(1)) as AnimalName);
        assert.ok(names.includes(expected), `Missing ${expected} on ${entry.path}`);
      }
    }
  }
  for (const { input, expectedAnimal } of cases) {
    const profile = await computeProfile(input);
    assert.ok(profile, `No profile for ${input.dateOfBirth}`);
    assert.equal(profile.chineseZodiac.animal, expectedAnimal, `Wrong animal for ${input.dateOfBirth}`);
    const art = animalArtwork(profile.chineseZodiac.animal as AnimalName);
    const html = renderToStaticMarkup(
      <FortuneCards labels={[`Life Path ${profile.numerology.lifePath.number}`, profile.westernAstro.sunSign.sign, expectedAnimal]} number={profile.numerology.lifePath.number} sunGlyph={profile.westernAstro.sunSign.glyph} animalArt={art} />,
    );
    assert.ok(html.includes(encodeURIComponent(`/artwork/${art}.png`)), `Summary card missed ${art}`);
    assert.ok(html.includes(profile.westernAstro.sunSign.glyph), `Summary card missed ${profile.westernAstro.sunSign.sign} glyph`);
    console.log(`${input.dateOfBirth}: ${profile.westernAstro.sunSign.sign} / ${expectedAnimal} / ${art}`);
  }
  console.log(`Verified ${chapterArt.length + animals.length} artwork files, ${cases.length} profile combinations, and illustrations on ${ALL_ENTRIES.length} library pages.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
