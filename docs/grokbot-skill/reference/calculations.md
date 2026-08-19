# Calculations

Every formula the app uses, written out. `scripts/cosmic.py` implements all of
this and its output is verified byte-identical to the production TypeScript for
numerology, sun/moon/rising signs and the Chinese zodiac. Compute by hand only if
you cannot run code, and say so when you do — the lunar formula in particular is
not hand-computable to useful accuracy.

---

## Numerology (Pythagorean)

### Letter values

```
1: A J S     4: D M V     7: G P Y
2: B K T     5: E N W     8: H Q Z
3: C L U     6: F O X     9: I R
```

**Y is always a consonant.** Some schools treat it as a vowel when it functions as
one ("Yvonne"), which is why other calculators sometimes disagree on Soul Urge and
Personality. The app made this choice deliberately; stay consistent with it.

Vowels are A, E, I, O, U. Non-letters (spaces, hyphens, apostrophes, digits) score
zero and are skipped.

### Name normalisation

Strip diacritics before scoring, so "José" scores as "Jose" and "Çolak" as "Colak":
Unicode NFD, then drop all combining marks. Five letters do not decompose under NFD
and are substituted explicitly:

```
ø Ø → o O      æ Æ → ae AE      œ Œ → oe OE      ł Ł → l L      đ Đ → d D
```

Note that æ and œ expand to *two* letters, and both count.

### Reduction

Sum digits repeatedly until a single digit — **except** that 11, 22 and 33 stop
immediately. These master numbers are never reduced, at any stage, in any
calculation.

```
38 → 3+8 = 11 → stop, 11 is a master number
39 → 3+9 = 12 → 1+2 = 3
48 → 4+8 = 12 → 1+2 = 3
```

### The five core numbers

**Life Path** — from the date of birth. Reduce month, day and year *separately*,
then sum those three and reduce again. The separate reduction matters: it is what
lets master numbers appear.

```
1990-06-15
  month 6                       → 6
  day   15 → 1+5                → 6
  year  1990 → 1+9+9+0 = 19 → 1+9 = 10 → 1+0 → 1
  6 + 6 + 1 = 13 → 1+3          → 4          Life Path 4
```

**Expression (Destiny)** — sum every letter of the full birth name, reduce.

**Soul Urge (Heart's Desire)** — sum only the vowels, reduce.

**Personality** — sum only the consonants, reduce.

```
ADA LOVELACE
  A=1 D=4 A=1 L=3 O=6 V=4 E=5 L=3 A=1 C=3 E=5
  Expression:  1+4+1+3+6+4+5+3+1+3+5 = 36 → 9
  vowels A A O E A E = 1+1+6+5+1+5    = 19 → 10 → 1
  consonants D L V L C = 4+3+4+3+3    = 17 → 8
```

**Personal Year** — birth month + birth day + **current** year, each reduced
separately, then summed and reduced. Note this uses the calendar year, so it rolls
over on 1 January, not on the person's birthday. (Some traditions roll it on the
birthday; the app does not.)

### Daily numbers (not in the web app)

**Personal Month** = reduce(Personal Year + reduce(month))

**Personal Day** = reduce(Personal Month + reduce(day))

**Universal Day** = reduce(reduce(month) + reduce(day) + reduce(year digits)) —
the day's own number, the same for everyone. Where the Personal Day and Universal
Day agree, the day's collective mood and the person's personal cycle are pointing
the same direction, which is worth mentioning.

---

## Chinese zodiac

### Which animal year

**Not the calendar year.** The zodiac year begins at Lunar New Year, which falls
between 21 January and 20 February. Someone born 1984-02-01 is a **Pig** (1983's
animal), not a Rat — Lunar New Year 1984 was 2 February.

`scripts/cosmic.py` carries the exact Lunar New Year dates for 1924-2044, matching
`lib/chinese-zodiac.ts`. Outside that range the fallback is: born before 5 February
→ previous year. That is a heuristic and can be wrong by up to two weeks; flag the
uncertainty if it comes up.

### Animal, element, polarity

With the zodiac year resolved:

- **Animal** = `ANIMALS[(year - 1924) mod 12]`, where the cycle starts Rat, Ox,
  Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig.
- **Element** = `ELEMENTS[floor(((year - 4) mod 10) / 2)]` over Wood, Fire, Earth,
  Metal, Water — the heavenly-stem cycle, two years per element.
- **Polarity** = Yang for even years, Yin for odd.

### Compatibility

Derived from the traditional structures rather than typed out as a table, which is
why it is symmetric by construction — if A harmonises with B, B harmonises with A.

**San He (三合) trines** — three-animal harmony groups, all mutually best-matched:

```
Rat · Dragon · Monkey        Ox · Snake · Rooster
Tiger · Horse · Dog          Rabbit · Goat · Pig
```

**Liu He (六合) secret friends** — additional harmonious pairs:

```
Rat–Ox   Tiger–Pig   Rabbit–Dog   Dragon–Rooster   Snake–Monkey   Horse–Goat
```

**Liu Chong (六冲) clashes** — direct opposition, six positions apart:

```
Rat–Horse   Ox–Goat   Tiger–Monkey   Rabbit–Rooster   Dragon–Dog   Snake–Pig
```

**Liu Hai (六害) harms** — quieter undermining:

```
Rat–Goat   Ox–Horse   Tiger–Snake   Rabbit–Dragon   Monkey–Pig   Rooster–Dog
```

Best matches = trine + secret friend. Challenging = clash + harm. "Challenging"
means friction that needs work, not doom — say it that way.

### Day pillar (daily readings only)

The sexagenary day cycle, for daily flavour. Take the Julian Day Number at noon
UTC, then `index = (JDN + 49) mod 60`; the animal is `ANIMALS[index mod 12]` and
the heavenly stem is `STEMS[index mod 10]`, each stem carrying an element (Jia/Yi
Wood, Bing/Ding Fire, Wu/Ji Earth, Geng/Xin Metal, Ren/Gui Water). Anchored so
that 2000-01-07 is a Jia-Zi (Wood Rat) day, which is the standard reference.

---

## Western astrology

All tropical zodiac, computed from real ecliptic longitude rather than fixed date
ranges — cusp births land in the correct sign for their specific year, since the
boundaries drift about a day either way.

### Birth instant

Convert local birth time to UTC by subtracting the UTC offset in effect at birth.
**When the birth time is unknown, use 12:00 local**, which puts cusp-day births in
whichever sign held for most of that day.

The offset must be historical, not current. Resolve the birth city to coordinates,
map coordinates to an IANA timezone, then ask for that zone's offset at that
instant — this is what handles DST and changes like Turkey's 2016 move to
permanent UTC+3. Getting it wrong shifts the rising sign by up to a full sign.

### Julian Day

```
if month <= 2:  year -= 1;  month += 12
A = floor(year / 100)
B = 2 - A + floor(A / 4)
JD = floor(365.25 × (year + 4716)) + floor(30.6001 × (month + 1))
     + day_with_fraction + B - 1524.5
```

### Sun sign and decan

Low-precision solar longitude, accurate to ~0.01° — far more than sign resolution
needs:

```
n = JD - 2451545.0
L = (280.460 + 0.9856474 × n) mod 360        mean longitude
g = (357.528 + 0.9856003 × n) mod 360        mean anomaly
λ = (L + 1.915 sin g + 0.020 sin 2g) mod 360
```

Sign = `SIGNS[floor(λ / 30)]`, in order Aries through Pisces. Decan =
`floor((λ mod 30) / 10) + 1` — true 10° divisions, not the calendar-thirds
approximation.

### Moon sign

Meeus, *Astronomical Algorithms* 2nd ed., Table 47.A: the 59 leading periodic
terms plus the A1/A2 additive corrections and a simplified nutation term.
Accurate to about 0.5°, which is fine for signs and hopeless by hand. See
`moon_longitude()` in `scripts/cosmic.py`.

**Without a birth time**, the moon is still often knowable: it moves ~13°/day, so
on most days it stays in one sign. Compute the sign at 00:00 and at 23:59 local —
if they agree, that is the moon sign; if they differ, return nothing and tell the
person you need their birth time to place it. Do not guess the midpoint.

### Rising sign (ascendant)

Needs birth time *and* coordinates. The point of the ecliptic rising on the
eastern horizon:

```
GMST = (280.46061837 + 360.98564736629 × (JD - 2451545.0)) mod 360
RAMC = (GMST + longitude) mod 360           local sidereal time
ε    = 23.4393°                             obliquity of the ecliptic
ASC  = atan2(cos RAMC, -(sin RAMC × cos ε + tan φ × sin ε))
```

φ is the birth latitude in radians, **clamped to ±66°** — inside the polar circles
some signs never rise and the formula degrades, so the clamp keeps extreme-latitude
births to a reasonable estimate rather than nonsense.

### Moon phase (daily readings only)

Elongation of the moon from the sun at 12:00 UTC: `(moon λ - sun λ) mod 360`.
Bucket into eight 45°-wide phases centred on the exact points, so 0° is New,
90° First Quarter, 180° Full, 270° Last Quarter. Illumination ≈
`(1 - cos angle) / 2`.

---

## Life stage

Not astrology — the tone control. Age gives the range:

```
<18 youth · <25 young adult · <35 early adulthood · <50 midlife · <65 mature · 65+ elder
```

Each selected stage carries focus areas, tone guidance, topics to emphasise and
topics to de-emphasise. When several stages are selected they merge:

- focus areas and emphasised topics **union**
- de-emphasised topics union, then **minus anything another selected stage wants
  emphasised** — so a parent who is also building a career does not get career
  ambition suppressed by the parent stage
- tone guidance **blends** rather than one stage winning

`prefer_not_to_say` is exclusive: selected alone, or alongside anything else, it
wins and the reading stays universal. An empty selection falls back to it too.

The full stage table is in `scripts/cosmic.py` (`LIFE_STAGES`) and mirrors
`lib/life-stages.ts` exactly.
