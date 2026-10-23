import type { LibrarySection } from "../../../lib/library/content";

/** Second paragraphs for each hub/calculator section, index-aligned. */
export const HUB_MORE: Record<string, string[]> = {
  library: [
    "New pages are added as the library grows, and each one is checked against the same calculation tables before it is published.",
    "None of these combinations is a verdict. They are simply the kind of pattern a reading is designed to notice and describe in plain language.",
    "Prices and scope are listed on the pricing page, and the fictional sample shows the full layout before you enter anything personal.",
    "If a page sparks a question about your own birth details, the free preview is the place to try it, since the library pages stay general on purpose.",
  ],
  numerology: [
    "Many people meet numerology through a single number, usually the Life Path, and only later discover that the name numbers add a second, more personal layer.",
    "Hyphenated and multiple given names are included in full, since the tradition treats every letter of the birth name as part of the calculation.",
    "Readers who know only their date of birth can still explore the Life Path and Personal Year, while the name numbers need the full birth name.",
    "The pages for 11, 22 and 33 explain each master number in more detail, alongside the root numbers they relate to.",
  ],
  "life-path": [
    "Each number's page also includes a worked example date and the traditional keywords taken directly from the calculation tables the app uses.",
    "Readers whose birthday falls on the 11th, 22nd or 29th, or in November, often see master numbers appear in the steps, which is one reason to check the working.",
    "Pair pages work in either order, so Life Path 9 and 1 leads to the same page as Life Path 1 and 9, and the reversed address simply redirects.",
    "Master numbers do not have pairing pages of their own, so the root number's pairings are the natural place to start.",
  ],
  zodiac: [
    "Element is often the first thing people notice when comparing two Sun signs, which is why the compatibility pages begin with it.",
    "Seasonal language follows the northern hemisphere convention that the zodiac was built around, even though the signs themselves are used worldwide.",
    "Rulers also explain some of the sign descriptions, such as Gemini's quick talk under Mercury or Capricorn's patience under Saturn.",
    "The sign directory below lists each sign's 2026 dates, element, modality and ruler, followed by links to all twelve of its pairings.",
  ],
  compatibility: [
    "Every pairing page uses the same structure, which makes it easy to compare, say, Aries with Libra against Aries with Leo.",
    "Elements are also where most popular compatibility charts begin, so the pages explain the reasoning rather than just the result.",
    "Same-sign pairings are included, since two people with the same Sun sign is one of the most common questions about compatibility.",
    "The free preview calculates your own Sun sign and, with a birth time, your Moon and rising signs as well.",
  ],
  astrology: [
    "The tropical and sidereal zodiacs now differ by roughly twenty-four degrees, which is why the same birth date can give different signs in Western and Vedic astrology.",
    "Because the rising sign moves so quickly, even a birth time rounded to the nearest hour can occasionally change it.",
    "Time zones and daylight saving are resolved from the birth place, using the time zone database, before any position is calculated.",
    "This scope is stated on every reading and on the pricing page, so a reader always knows which parts are calculated and which are interpretation.",
  ],
  "chinese-zodiac": [
    "Folk stories differ in their details from region to region, but the fixed order of the twelve animals is the same everywhere the system is used.",
    "The animal pages list each animal's years from 1924 to 2044, with the element attached to each year.",
    "Five-element relationships between animals appear on every Chinese zodiac pairing page in this library.",
    "Polarity also appears in the key-facts table on every animal page, alongside the animal's branch and fixed element.",
  ],
  "chinese-zodiac-compatibility": [
    "Trine membership appears on every animal page and pair page, so it is easy to see which group an animal belongs to.",
    "Unlike the trines, the secret-friend pairs are one-to-one, so each animal has exactly one Liu He partner.",
    "The pair pages for these combinations describe the specific tension each one is traditionally associated with.",
    "Every pairing page also lists the trines both animals belong to, which helps place an open pairing in context.",
  ],
  "life-path-calculator": [
    "If you only want the number, it appears as soon as you finish entering the date, with a link to its page.",
    "The difference is small for most dates but matters for anyone hoping to compare results across different sources.",
    "If your result is a master number, the link takes you to its own page, which also discusses the root.",
    "Nothing is saved between visits, so you can try several dates, such as a partner's or a friend's, without leaving a trace.",
  ],
  "zodiac-sign-calculator": [
    "The result also shows your sign's element, modality and ruling planet, and links to the sign's entry in the zodiac guide.",
    "Neighbouring signs are, by definition, a semi-sextile apart, so they rarely share an element or modality.",
    "Decans are one of several layers that help explain why Sun sign descriptions fit some people better than others.",
    "Nothing you enter here is saved, so you can check several dates in a row without leaving a record.",
  ],
  "chinese-zodiac-calculator": [
    "The result shows the year element, animal and polarity together, such as Yang Metal Horse, so the full combination is clear.",
    "If your date falls in January or February, the result also states which side of the boundary it falls on.",
    "Sixty-year cycles are the reason a grandparent and grandchild can share both animal and element, such as two Metal Horses born sixty years apart.",
    "Nothing you enter here is saved or sent anywhere, so you can try several dates, such as family members' birthdays, in a row.",
  ],
};

/** A fifth section per hub/calculator. */
export const HUB_FIFTH: Record<string, LibrarySection> = {
  library: {
    heading: "Where to start",
    paragraphs: ["If you are new to all three traditions, the calculators are the quickest way in: enter a birth date once and you will see a Life Path number, a Sun sign and a Chinese animal, each linking to its own guide. If you already know your numbers and signs, the compatibility sections are the most popular part of the library. Life Path pairings compare two numbers through odd and even energy, the thinker, builder and creative families, and the combined number. Zodiac pairings compare elements, modalities, rulers and the angle between two signs. Chinese zodiac pairings use the classical trines, secret friends, clashes and harms along with the five-element cycles. For background, the numerology, astrology and Chinese zodiac guides explain the methods and their limits in more depth. Wherever you start, every page links onward to related pages, so it is easy to follow a thread from one tradition into another and see where the themes repeat or diverge."],
  },
  numerology: {
    heading: "Personal Year cycles",
    paragraphs: ["The Personal Year is the only core number that changes, and it is often the most immediately practical. It is calculated from the birth month and day plus the current calendar year, reduced in the same way as a Life Path, so it moves through a cycle from 1 to 9 before starting again. A Personal Year 1 is read as a time of beginnings and initiative, 2 as patience and partnership, 3 as expression and sociability, 4 as building foundations, 5 as change, 6 as home and responsibility, 7 as reflection, 8 as achievement and authority, and 9 as completion and release. Master years 11, 22 and 33 can also appear. A Unified Reading includes the current Personal Year because it frames the rest of the reading in time, suggesting which of a person's longer-term themes may feel most active now. Like every number here, it describes a mood to notice rather than events that are bound to occur."],
  },
  "life-path": {
    heading: "Life Path, name numbers and the full picture",
    paragraphs: ["The Life Path is the centre of most numerology readings, but it rarely works alone. Two people with the same Life Path can have very different Expression, Soul Urge and Personality numbers, and those name-based numbers often explain why one Life Path 5 is a bold traveller while another channels the same restlessness into a constantly changing career. The Personal Year adds timing, describing which themes may feel active now. A Unified Reading calculates all of these from the birth name and date, then sets them beside the Western Sun sign and Chinese animal, noting where the systems reinforce each other and where they pull apart. If your Life Path and Sun sign tell similar stories, the reading leans into that agreement; if they contrast, it treats the contrast as complexity rather than contradiction. That synthesis is what the library pages point toward, one tradition at a time."],
  },
  zodiac: {
    heading: "Signs, opposites and the zodiac wheel",
    paragraphs: ["The twelve signs are often pictured as a wheel, and their positions on it explain a lot about how they are described. Each sign has an opposite six signs away: Aries and Libra, Taurus and Scorpio, Gemini and Sagittarius, Cancer and Capricorn, Leo and Aquarius, Virgo and Pisces. Opposites share a modality and have complementary elements, so they are read as two approaches to the same theme, such as self and partnership for Aries and Libra, or security and transformation for Taurus and Scorpio. Signs four apart share an element and form the classic trines, while signs three apart share a modality and form squares. Neighbouring signs contrast sharply, which is why astrologers sometimes describe each sign as a reaction to the one before it, Taurus steadying Aries' rush or Gemini loosening Taurus' hold. Reading a sign alongside its opposite and its neighbours is often more revealing than reading it alone."],
  },
  compatibility: {
    heading: "Same-sign and opposite-sign pairings",
    paragraphs: ["Two kinds of pairing come up more than any others: two people with the same Sun sign, and two people with opposite signs. Same-sign pairs share element, modality and ruler, so they tend to recognise each other's instincts immediately. The traditional caution is that they also share blind spots: two Geminis may both avoid heavy conversations, and two Capricorns may both work too much. Opposite-sign pairs, such as Cancer and Capricorn or Leo and Aquarius, share a modality and have complementary elements, and they are often described as magnetic because each embodies what the other is learning. The traditional caution there is polarisation, with each partner exaggerating their own side. Every one of the twelve same-sign and six opposite-sign pairs has its own page, and those pages describe what tends to help: variety from outside the relationship for same-sign pairs, and borrowing a little of the other's approach for opposites."],
  },
  astrology: {
    heading: "Why the library stays at the level of signs",
    paragraphs: ["The pages in this library describe whole signs and the relationships between them, rather than individual birth charts, for two reasons. First, sign-level relationships rest only on facts that can be calculated from a date: which sign the Sun was in, which element and modality that sign has, and how far apart two signs sit on the wheel. Second, they match what a Unified Reading actually computes, so nothing here implies a precision the reading does not offer. When the compatibility pages use names such as trine, square or opposition, they borrow the traditional vocabulary for the angle between two signs, which is a coarse but useful lens. A professional astrologer working with full birth times would look at exact planetary positions, house placements and aspects in both charts, and might reach different conclusions about a particular couple. The library is a starting point for reflection, and it is honest about where its view ends and a fuller chart would begin."],
  },
  "chinese-zodiac": {
    heading: "The sixty-year cycle",
    paragraphs: ["Because the twelve animals and the ten heavenly stems advance together, a given combination of element and animal returns only every sixty years. This sexagenary cycle has been used to count years in China for well over two thousand years, and it gives each year a two-part name, a stem and a branch, that maps onto the element and animal of the zodiac. The current cycle began in 1984 with the Wood Rat and will return to it in 2044, which is also the last year in Unified Reading's Lunar New Year table. In everyday terms, the cycle explains why people sometimes say they are a particular kind of animal, a Fire Horse or a Water Rabbit, and why turning sixty is a significant birthday in many East Asian cultures: it marks the return of the year element and animal of one's birth. The animal pages list each year's element so you can find your own combination quickly."],
  },
  "chinese-zodiac-compatibility": {
    heading: "Same-animal pairs and reading a pairing well",
    paragraphs: ["Two people born in the same animal's year, whether in the same year or twelve or twenty-four years apart, form a same-animal pair. The classical tables do not count these among the harmonies or clashes, and traditional readings describe them as mirrors: each partner recognises the other's motives and habits, and the shared blind spot tends to show up twice. A pair of Roosters may both criticise freely; a pair of Pigs may both avoid hard conversations. Their year elements can still differ, which adds variety. More generally, a good way to read any pairing page is to start with the classical relationship, then look at the five-element cycle between the two animals' fixed elements, then at what each animal tends to need and where friction starts. Read together, those layers give a picture of tendencies that two people can recognise, discuss and work with, which is what the tradition is best used for."],
  },
  "life-path-calculator": {
    heading: "Worked examples",
    paragraphs: ["A few more dates show how the method handles different cases. For 15 March 1978, the month 3 stays 3, the day 15 reduces to 6, and the year 1978 sums to 25 and then 7, giving 3 plus 6 plus 7, which is 16, so Life Path 7. For 29 November 1990, the month 11 is kept as a master number, the day 29 sums to 11 and is also kept, and the year 1990 reduces to 1, so the total is 11 plus 11 plus 1, which is 23, giving Life Path 5. For 22 April 2000, the day 22 is kept whole, the month is 4 and the year 2000 reduces to 2, and 4 plus 22 plus 2 makes 28, which reduces to 10 and then 1. For 9 September 1999, the parts are 9, 9 and 28 reduced to 1, so 9 plus 9 plus 1 is 19, then 10, then 1. Entering any of these dates in the calculator shows the same working."],
  },
  "zodiac-sign-calculator": {
    heading: "The twelve signs in order",
    paragraphs: ["For reference, the signs run in this order through the year, with the dates on which the Sun entered each one in 2026. Aries begins on March 21, Taurus on April 20, Gemini on May 21, Cancer on June 21, Leo on July 23, Virgo on August 23, Libra on September 23, Scorpio on October 23, Sagittarius on November 22, Capricorn on December 22, Aquarius on January 20 and Pisces on February 19. In other years each date can move by a day, which is the whole reason this calculator uses the Sun's position rather than a table. The order also shows the pattern of elements, Fire, Earth, Air and Water repeating three times, and of modalities, cardinal, fixed and mutable repeating four times. Once you have your sign, its entry in the zodiac guide lists its element, modality and ruler, and the compatibility section compares it with each of the other eleven signs and with itself."],
  },
  "chinese-zodiac-calculator": {
    heading: "Examples near the boundary",
    paragraphs: ["Births in late January and early February are where most mistakes happen, so a few examples help. Someone born on January 25, 2020 is a Rat, because Lunar New Year fell that very day, while someone born a day earlier is a Pig from the year that began in 2019. Someone born on February 4, 2000 is a Rabbit, as Lunar New Year 2000 fell on February 5, and someone born on February 5 is a Dragon. In 1985 the new year came unusually late, on February 20, so anyone born between January 1 and February 19 that year is a Rat rather than an Ox. And in 2023 it came early, on January 22, so a birthday on January 25, 2023 already belongs to the Rabbit. The calculator handles every one of these cases from its Lunar New Year table, and it shows the boundary date so you can see exactly why it reached its answer."],
  },
};

/** Extra paragraphs appended to a hub/calculator section, keyed by section index. */
export const HUB_EXTRA: Record<string, Record<number, string>> = {
  library: {
    3: "Editors revise pages over time, and each one shows when it was last updated at the bottom, along with whether it has had a human review yet.",
  },
  numerology: {
    2: "Unified Reading reports all five numbers in the free preview, with a brief description beside each, so you can compare them before deciding whether to unlock the longer synthesis.",
  },
  "life-path": {
    4: "Which number resonates is ultimately personal, and some readers feel the root describes them better than the master number, or the other way round.",
  },
  zodiac: {
    0: "Some astrologers also speak of a sign's element being expressed through its modality, so that Aries is often summarised as initiating fire, Leo as sustained fire and Sagittarius as roaming, adaptable fire.",
    2: "Modern rulers were assigned after Uranus, Neptune and Pluto were discovered, in 1781, 1846 and 1930 respectively, so both schemes remain in circulation and appear side by side in many guides.",
    1: "Seasonal timing also gives each modality a mood: cardinal signs arrive like a change of weather, fixed signs hold the season steady, and mutable signs prepare the shift toward whatever comes next.",
  },
  compatibility: {
    1: "In practice, element balance between two people often shows up in everyday rhythms: who wants to go out and who wants to stay in, who plans and who improvises, who talks a feeling through and who quietly acts on it.",
    3: "Couples who know their birth times can go further with the free preview, which shows each person's Moon and rising sign alongside the Sun.",
    0: "Readers sometimes arrive expecting a simple yes or no; the pages instead aim to give two people a shared vocabulary for differences they have probably already noticed.",
  },
  astrology: {
    0: "Astronomers and astrologers once overlapped heavily, which is why much astrological vocabulary, from ecliptic to equinox, is also astronomical vocabulary. The calculations behind a Sun sign are ordinary positional astronomy; only the interpretation belongs to the tradition.",
    1: "A useful shorthand many readers adopt: the Sun describes what someone is becoming, the Moon what they need in order to feel safe, and the rising sign how they tend to approach new people and situations.",
    3: "Readers who want aspects, transits or a quadrant house system such as Placidus are best served by a dedicated chart from a practising astrologer, and Unified Reading says so rather than approximating them.",
    2: "Unknown or uncertain birth times are common, and the form lets readers say so explicitly; the resulting report labels the chart as approximate wherever precision would otherwise be implied.",
  },
  "chinese-zodiac": {
    0: "Shengxiao literally refers to the animals that people are born under, and the system is woven into festivals, New Year decorations, gifts and greetings across China, Korea, Vietnam, Japan and diaspora communities worldwide.",
    1: "Lunar New Year itself is a moveable feast tied to the lunisolar calendar, so its date in the Gregorian calendar wanders by several weeks over a few years, rather than drifting slowly the way the zodiac signs do.",
    2: "Some readers also notice how their year element colours their animal: a Water Tiger is often described as calmer and more strategic, a Fire Tiger as louder and quicker to act.",
    3: "Yin and yang are also applied to the heavenly stems, so each element has a yang year and a yin year, Yang Wood followed by Yin Wood, and so on through the cycle. Opposites therefore balance rather than cancel.",
    4: "Elders in many families still mark these anniversaries with banquets, red clothing or gifts, honouring the completion of a full cycle of stems and branches.",
  },
  "chinese-zodiac-compatibility": {
    0: "Folk wisdom often summarises the trines with simple images: the Water trine as clever strategists, the Metal trine as diligent perfectionists, the Fire trine as passionate idealists and the Wood trine as gentle peacemakers.",
    2: "In practice, a clash or harm is often described as a pairing where the two people need to make their expectations explicit, since their instincts about pace, money, closeness or conflict may run in opposite directions. Awareness, patience and humour usually matter more than the label.",
    3: "Family members are sometimes compared in the same way, and parents occasionally look at a child's animal alongside their own, though the tradition offers these comparisons as conversation rather than instruction.",
    1: "Some interpreters link each secret-friend pair with an element it produces together, though sources disagree on several of those combinations, so the library does not rely on them.",
  },
  "life-path-calculator": {
    0: "Behind the scenes it uses the same JavaScript module that the full reading uses, so the number shown here always matches the number in a Unified Reading for the same date. Typing a date with the keyboard or choosing it from the browser's date picker gives identical output, and the result updates immediately whenever you adjust any digit.",
    1: "Readers who were taught the single-string method at school or in a book sometimes find their number changes here; neither method is wrong, but they are not interchangeable. Older paperback guides, magazine columns and some mobile apps favour the single-string approach because it is quicker to explain, which explains much of the confusion online.",
    2: "A Life Path of 11, 22 or 33 is shown with a short note confirming it is a master number, together with the root it reduces to. Grandparents, parents and children occasionally share a master number, which families sometimes enjoy discovering together.",
    3: "The Expression, Soul Urge and Personality numbers need the full birth name, so they appear only in the preview, never on this page, and the name is never requested here. Couples curious about their combination can open the pairing page for their two numbers straight from the result links.",
    4: "Spreadsheets and paper work just as well: write the month, day and year in a column, reduce each one, add them, and reduce again, pausing whenever 11, 22 or 33 appears.",
  },
  "zodiac-sign-calculator": {
    0: "The solar position formula is the same compact series used in many almanacs, refined enough for sign and decan boundaries while staying fast enough to run instantly on a phone.",
    1: "Birth times recorded in local time are converted to Universal Time before the Sun's position is checked, which matters for births late in the evening or soon after midnight.",
    3: "Shared birthdays make a fun experiment: two people born on the same date in different years can occasionally have different Sun signs if that date is a cusp.",
    2: "Triplicity rulership, the scheme mentioned here, is only one of several historic decan systems; Egyptian and Hellenistic sources used others, including the Chaldean planetary order.",
  },
  "chinese-zodiac-calculator": {
    0: "Behind the scenes it uses the same module the full reading uses, so the animal shown here always matches a Unified Reading for the same date. Typing the date or picking it from the browser's calendar widget gives identical results, refreshed instantly.",
    1: "Families often discover the boundary when comparing siblings born in the same calendar year who turn out to have different animals, or cousins born a year apart who share one. Hospital records, passports and birth certificates virtually everywhere use Gregorian dates, so the table does the translation into lunar years for you.",
    2: "Polarity follows the stems too, so the element always appears in a fixed order of Yang then Yin: Yang Fire in years ending 6, Yin Fire in years ending 7, and so on around the decade.",
    3: "Month, day and hour animals belong to the fuller Four Pillars system, which needs an exact birth time and a solar-term calendar, and is outside the scope of this site. Professional practitioners consult printed almanacs, or specialised software, for those detailed calculations.",
    4: "Gregorian dates before 1924 or after 2044 fall outside the table, and for those the calculator applies a February 5 rule of thumb that is right most years but occasionally off by an animal for births in the first week of February.",
  },
};

export const HUB_FAQ: Record<string, { question: string; answer: string }> = {
  library: { question: "Who writes the library pages?", answer: "Unified Reading's editorial team writes and maintains the guides. Calculated facts come straight from the app's code; interpretation is editorial and marked for human review before it is promoted in search." },
  numerology: { question: "Does numerology work with names in other alphabets?", answer: "The Pythagorean chart is defined for the Latin alphabet. Accented letters are reduced to their base letters, but names written in other scripts need a transliteration first, and results depend on which transliteration is used." },
  "life-path": { question: "What does a Life Path number say about career?", answer: "Each Life Path page has a section on work describing the environments and roles traditionally associated with that number. These are themes to consider alongside skills, values and circumstances, not career advice." },
  zodiac: { question: "Which zodiac sign is the most compatible with mine?", answer: "Astrology does not single out one best match. The compatibility section compares your sign with all twelve signs, describing what each pairing tends to make easier and harder." },
  compatibility: { question: "Can two people with challenging signs have a good relationship?", answer: "Yes. Squares, quincunxes and oppositions are described as challenging because they ask for more adjustment, and many astrologers consider that friction a source of growth. The signs describe dynamics, not outcomes." },
  astrology: { question: "What is a decan?", answer: "A decan is one of three 10-degree subdivisions of a sign. Unified Reading reports which decan the Sun was in, adding a little nuance to the Sun sign description." },
  "chinese-zodiac": { question: "Which animal is the current year?", answer: "2026 is the year of the Horse, a Fire Horse, from Lunar New Year on February 17, 2026 until Lunar New Year 2027 on February 6. 2027 will be the year of the Goat." },
  "chinese-zodiac-compatibility": { question: "Do the year elements change compatibility?", answer: "The classical structures use the animals alone. Year elements add a second layer that some practitioners weigh, using the generating and controlling cycles, which a full reading can describe for an individual." },
  "life-path-calculator": { question: "Can I calculate a Life Path for someone else?", answer: "The arithmetic works for any date, and nothing is stored. A Unified Reading itself should be requested by the person it describes, with their own details." },
  "zodiac-sign-calculator": { question: "Why does the result mention a decan?", answer: "Each sign is split into three 10-degree decans. The calculator shows which one the Sun was in, which some astrologers use to refine a Sun sign description." },
  "chinese-zodiac-calculator": { question: "What animal is 2026?", answer: "The Horse. Lunar New Year 2026 fell on February 17, so anyone born from that date until February 5, 2027 is a Fire Horse, a Yang year." },
};
