# Daily readings

The web app is a one-shot report: you fill in a form, you get a profile. A daily
reading is a different product with a different failure mode. A profile that is
slightly generic still lands, because the person is reading it once. A *daily*
message that is slightly generic becomes obviously worthless by about day four,
when they notice they have read this before.

So the rule for everything below: **the daily message must be something that could
only have been written for this person on this date.** If it would read the same
tomorrow, or the same for their friend, delete it and start again.

---

## Subscribing someone

Minimum viable subscription is a date of birth. Anything else deepens it:

- **Date of birth** (required) — Personal Day, Personal Month, Personal Year, Life Path, natal sun sign, Chinese animal
- **Full birth name** — lets you reference their Expression and Soul Urge as recurring themes
- **Timezone** (or just "what time do you want it?") — so it arrives in their morning, not yours
- **Life stage** — the same number gets framed differently for someone job-hunting and someone retired

Confirm the subscription explicitly and say what they will get and how to stop it.
Something like: *"Done — I'll send you a reading each morning around 8. Say
'pause readings' any time and I'll stop."*

Store: birth date, birth name, timezone, delivery hour, life stage, and a rolling
memory of the last seven sends (see Repetition below). Nothing else needs keeping.

## Cadence

Default to daily in the morning. Honour whatever they ask for instead — every
weekday, Mondays only, "just tell me when something interesting happens".

Always accept, in any phrasing: pause, resume, change the time, change the
frequency, stop entirely. Someone who says "stop" once should never get another
message. Do not ask them to confirm that they really want to stop, and do not
send a farewell reading.

---

## What drives the reading

Run `python3 scripts/cosmic.py daily --dob YYYY-MM-DD --name "..." --date YYYY-MM-DD`.
You get:

| Field | Role in the message |
|---|---|
| `personalDay` | **The spine.** Almost every daily reading is fundamentally about this number. |
| `personalMonth` | The month's backdrop — mention when it reinforces or fights the day. |
| `personalYear` | The year's arc. Reference occasionally, not daily. |
| `universalDay` | The collective mood. Worth naming when it matches their personal day. |
| `moonPhase` | Emotional weather, with built-in guidance text. |
| `transitMoonSign` | Where feeling is running today. Strongest when it hits their natal sun or moon sign. |
| `dayPillar` | Chinese day animal and element. Best used as an accent, especially when it clashes or harmonises with their own animal. |
| `sunSeason` | Current solar season. Matters most at ingress and around their birthday. |
| `lifePath`, `natalSunSign`, `chineseAnimal` | Their fixed profile — what today's transient numbers are landing *on*. |

The interesting material is almost always in the **interaction**, not the lookup.
"Personal Day 5" is a horoscope. "Personal Day 5 landing in a Personal Month 4,
so the restlessness is real but this is a week for finishing things" is a reading.

## Personal Day meanings

Nine-day cycle, same archetypes as the Personal Year but scaled to a single day —
one year's worth of theme compressed into one day's worth of texture.

| Day | Theme | Feels like | Good for | Watch for |
|---|---|---|---|---|
| **1** | Initiation | A clean edge, slight impatience | Starting, deciding, asking | Steamrolling people |
| **2** | Cooperation | Sensitivity turned up | Listening, mending, patience | Taking things personally |
| **3** | Expression | Sociable, scattered, funny | Writing, pitching, seeing people | Talking instead of doing |
| **4** | Structure | Heavy, grounded, unglamorous | Admin, systems, finishing | Grinding past the point of use |
| **5** | Change | Restless, curious, itchy | Variety, travel, breaking routine | Blowing up something that was fine |
| **6** | Responsibility | Warm, dutiful, pulled-upon | Family, care, making things nice | Over-giving and resenting it |
| **7** | Withdrawal | Quiet, internal, allergic to noise | Thinking, research, solitude | Reading isolation as loneliness |
| **8** | Power | Sharp, ambitious, transactional | Money, negotiation, asking for it | Confusing force with authority |
| **9** | Completion | Tender, retrospective, loose-ended | Finishing, forgiving, clearing out | Clinging to what is ending |
| **11** | Heightened | Thin-skinned, unusually perceptive | Intuition, inspiration, connection | Nervous system overload |
| **22** | Building | Wide-angle and practical at once | Long-horizon work that needs both | Grandiosity without a first step |
| **33** | Service | Openhearted, others-oriented | Teaching, healing, showing up | Self-erasure |

## Composition

**60-120 words.** Read on a phone, between other things. Longer is not richer.

Structure that works:

1. **Name today's number and what it actually feels like** — the felt sense, not the label.
2. **One interaction** — day against month, or moon against their natal sun, or the day pillar against their animal. Pick one; do not stack three.
3. **One specific thing to do or watch for.** Concrete enough to act on before lunch.

Skip greetings, sign-offs, and any sentence that exists to introduce the next
sentence. Open on the substance.

```
Personal Day 7 inside a Personal Month 3 — the month wants you social and
the day wants you alone, and the day is going to win. Don't schedule anything
you'd have to perform at. The moon's in Scorpio, which sharpens this into real
focus rather than just wanting to hide: it's a good afternoon for the problem
you've been circling but haven't sat down with. Save the people for tomorrow.
```

```
Personal Day 1, and your Personal Year is 9 — beginnings inside an ending.
Whatever you start today is a seed for a cycle that hasn't opened yet, so keep
it small and don't over-commit. One phone call, one first draft. Waning
crescent moon: low fuel, so pick the start that takes twenty minutes, not the
one that takes the whole day.
```

## Repetition

The Personal Day cycles every nine days and the phrasing will collapse into a
formula unless you actively fight it. Keep the last seven sends and enforce:

- **Never open the same way twice in a week.** Not "Personal Day N" every morning.
- **Rotate the secondary lens.** Moon phase today, day pillar tomorrow, personal
  month the day after. Any one of them used daily becomes wallpaper.
- **Vary the register.** Some days a question. Some days a flat observation. Some
  days one blunt sentence and nothing else.
- **When their day number repeats, say something different about it.** The ninth
  day is the second Personal Day 5 they have had — reference that. "Second 5 in
  nine days, and unlike last time you've got a Full Moon behind it" is a reading
  that could not be written by a lookup table.
- **Some days deserve less.** A quiet day can honestly get two sentences. Padding
  a nothing day to hit a word count is how the whole thing starts to feel fake.

## Days worth breaking format for

- **Their birthday.** Say it first, warmly, and read the year ahead rather than the day. The Personal Year that started in January is the frame; the birthday is the emotional marker.
- **Personal Day 1 after a 9.** A new nine-day cycle. Worth naming as one.
- **1 January.** Their Personal Year number changes. This is the single biggest recurring event in the whole system — give it a proper reading, not a daily.
- **Personal Day == their Life Path.** The day's energy matches their permanent one. These tend to be the days people report feeling most like themselves.
- **New and Full Moon.** Real markers, and the phase guidance from the script is a good spine.
- **Lunar New Year.** Their Chinese animal's relationship to the incoming year animal — clash years in particular are worth flagging kindly and early.
- **A day pillar that clashes with their animal** (see the Liu Chong pairs in `calculations.md`). Traditionally a friction day. Frame as "expect drag", never as bad luck.

## Weekly and monthly variants

Some people want less. A **Monday weekly** covers the Personal Month plus the
week's arc of Personal Days — name the two or three days that stand out and why,
so they can plan around them. This is genuinely more useful than seven dailies for
anyone who schedules their own week.

A **monthly** on the 1st reads the Personal Month against the Personal Year, and
flags the standout days of the month. Longer, 200-300 words, closer to a short
version of the full reading's "This Season For You".

## What a daily must never do

- Predict events. "Today you'll hear good news" is a lie with a 1-in-n chance of
  looking true, and it is the fastest way to turn this into a fortune-telling
  service.
- Warn about health, money or safety. No "be careful driving today", no "watch
  your heart", no "avoid signing anything". This is where daily horoscopes do real
  harm to people who take them seriously.
- Manufacture urgency to keep engagement up. No "don't miss this rare window".
- Read as a to-do list. It is a lens on the day the person is already having.
- Keep arriving when someone has gone quiet for weeks. Check in once, ask if they
  still want them, and stop if there is no answer.
