/**
 * Hand-written Western zodiac relationship copy. Elements, modalities and
 * rulers come from lib/western-astrology.ts ZODIAC_SIGNS (modern rulers:
 * Pluto for Scorpio, Uranus for Aquarius, Neptune for Pisces).
 */

import { an, cap } from "./util";

export interface SignCopy {
  inLove: string;
  needs: string;
  friction: string;
  frictionShort: string;
  gift: string;
  twin: string;
  talk: string;
  helps: string;
}

export const SIGN_COPY: Record<string, SignCopy> = {
  Aries: {
    talk: "In conversation, Aries is usually quick and candid. It says the thing, wants an answer and would rather have a short argument than a long silence.",
    helps: "What helps with Aries is a clear yes or no, shared physical activity, and letting disagreements end with a concrete next step instead of an open question.",
    inLove: "Aries tends to love openly and quickly. As a Sun sign it is linked with courage and directness, so an Aries partner often makes the first move, says what they want and shows care through action: planning, protecting, defending. Interest can be obvious and energising.",
    needs: "Aries usually needs honesty, a partner who can match its pace, and room to act on impulse without being punished for it.",
    friction: "When stressed, Aries can be impatient, argue to win and move on from a conflict before the other person feels finished.",
    frictionShort: "Aries' impatience",
    gift: "Aries offers momentum and the courage to try.",
    twin: "Two Aries Suns often fall into a fast, competitive and affectionate rhythm. Both like action and honesty, so very little goes unsaid. The difficulty is that both want to lead, and arguments can flare as quickly as they cool. Pairs of Aries tend to do best when they compete side by side against something outside the relationship rather than with each other.",
  },
  Taurus: {
    talk: "In conversation, Taurus tends to be measured and deliberate. It listens, takes its time and prefers to return to a topic once it has thought it through.",
    helps: "What helps with Taurus is advance notice, unhurried time together, and showing reliability over weeks rather than trying to win a point in one evening.",
    inLove: "Taurus tends to love steadily and sensually. The sign is linked with patience and loyalty, so a Taurus partner often builds trust slowly, shows care through comfort and practical reliability, and enjoys shared routines such as meals, music and familiar places.",
    needs: "Taurus usually needs security, consistency and time to adjust, along with physical affection and a partner who keeps their word.",
    friction: "When stressed, Taurus can dig in, resist change on principle and go quiet rather than discuss what is wrong.",
    frictionShort: "Taurus' resistance to change",
    gift: "Taurus offers steadiness and a sense of home.",
    twin: "Two Taurus Suns often create a calm, comfortable and loyal partnership with shared appreciation for good food, beauty and stability. Trust grows reliably. The risk is that both prefer the familiar, so the relationship can become stuck, and disagreements turn into standoffs. Pairs of Taurus tend to do best when they introduce change gradually and on purpose.",
  },
  Gemini: {
    talk: "In conversation, Gemini is often fast, funny and exploratory, thinking out loud and jumping between topics, sometimes mid-sentence.",
    helps: "What helps with Gemini is variety, a willingness to talk things through more than once, and keeping serious conversations short and specific.",
    inLove: "Gemini tends to love through conversation and curiosity. The sign is linked with communication and adaptability, so a Gemini partner often courts with wit, questions and shared ideas, and keeps a relationship lively with plans, messages and new interests.",
    needs: "Gemini usually needs mental stimulation, variety and a partner who enjoys talking things through without making every exchange heavy.",
    friction: "When stressed, Gemini can become scattered, change its mind often or talk around feelings instead of naming them.",
    frictionShort: "Gemini's restlessness",
    gift: "Gemini offers curiosity and a light touch.",
    twin: "Two Gemini Suns often share a playful, talkative and ever-changing partnership. Conversation rarely runs dry, and both enjoy novelty. The risk is that neither grounds the relationship, so plans shift constantly and deeper feelings can be skipped over. Pairs of Gemini tend to do best when they keep one or two steady commitments alongside the variety.",
  },
  Cancer: {
    talk: "In conversation, Cancer tends to read tone before words and may approach a sensitive subject indirectly, testing whether it is safe to say more.",
    helps: "What helps with Cancer is gentleness at the start of hard talks, small reassurances, and honouring family occasions and private rituals.",
    inLove: "Cancer tends to love protectively and deeply. As a Sun sign it is linked with nurturing and emotional memory, so a Cancer partner often creates a sense of home, remembers what matters to people and shows care through attention and looking after them.",
    needs: "Cancer usually needs emotional safety, reassurance and a partner who treats family and private life as important.",
    friction: "When stressed, Cancer can retreat into its shell, become moody or hold on to a hurt long after it seemed resolved.",
    frictionShort: "Cancer's sensitivity to hurt",
    gift: "Cancer offers emotional care and belonging.",
    twin: "Two Cancer Suns often build a warm, intuitive and protective partnership with a strong focus on home. Each understands the other's moods. The risk is that both withdraw at the same time, or that unspoken hurts accumulate. Pairs of Cancer tend to do best when they say feelings aloud rather than expecting them to be sensed.",
  },
  Leo: {
    talk: "In conversation, Leo is usually expressive and warm, telling stories with flair and wanting to feel that the listener is genuinely engaged.",
    helps: "What helps with Leo is sincere praise, public loyalty, and raising criticism privately, framed around what is already going well.",
    inLove: "Leo tends to love generously and visibly. The sign is linked with warmth, creativity and pride, so a Leo partner often makes grand gestures, celebrates the people they love and brings energy and fun into a relationship.",
    needs: "Leo usually needs appreciation, loyalty and admiration given freely, along with a partner who enjoys some drama and celebration.",
    friction: "When stressed, Leo can become proud, sensitive to being overlooked and unwilling to back down in public.",
    frictionShort: "Leo's pride",
    gift: "Leo offers warmth, generosity and celebration.",
    twin: "Two Leo Suns often make a warm, glamorous and loyal pair, generous with praise and fun. Life together can feel like an occasion. The risk is competition for attention and pride-driven standoffs. Pairs of Leo tend to do best when they cheer each other on and take turns at the centre.",
  },
  Virgo: {
    talk: "In conversation, Virgo tends to be precise and practical, offering detail, suggestions and the improvement that nobody else spotted.",
    helps: "What helps with Virgo is acknowledging the effort behind its help, clear plans, and gentle reminders that good enough is sometimes enough.",
    inLove: "Virgo tends to love through attention to detail and practical help. The sign is linked with care, precision and modesty, so a Virgo partner often shows affection by noticing what is needed and quietly taking care of it.",
    needs: "Virgo usually needs order, reliability and a partner who appreciates thoughtful effort rather than grand displays.",
    friction: "When stressed, Virgo can become critical, anxious about details and hard on itself or its partner.",
    frictionShort: "Virgo's critical streak",
    gift: "Virgo offers practical care and thoughtful attention.",
    twin: "Two Virgo Suns often create an organised, considerate and dependable partnership with shared standards. Daily life tends to run smoothly. The risk is mutual criticism and worry, with small flaws getting more attention than they deserve. Pairs of Virgo tend to do best when they praise as precisely as they correct.",
  },
  Libra: {
    talk: "In conversation, Libra is usually diplomatic and considerate, weighing both sides and choosing words to keep the mood pleasant.",
    helps: "What helps with Libra is asking directly for its opinion, making decisions together, and showing that a disagreement will not damage the bond.",
    inLove: "Libra tends to love through partnership, charm and fairness. The sign is linked with balance and harmony, so a Libra partner often seeks shared experiences, beautiful settings and a relationship where both people feel equally considered.",
    needs: "Libra usually needs harmony, mutual respect and a partner who values companionship and good manners.",
    friction: "When stressed, Libra can avoid conflict, hesitate over decisions and keep the peace at the cost of its own preferences.",
    frictionShort: "Libra's indecision",
    gift: "Libra offers fairness, grace and companionship.",
    twin: "Two Libra Suns often form a gracious, sociable and balanced partnership with shared taste and courtesy. Both value fairness. The risk is that neither wants to make the hard call or name a problem, so tension simmers under the politeness. Pairs of Libra tend to do best when they agree that honest disagreement is part of harmony.",
  },
  Scorpio: {
    talk: "In conversation, Scorpio tends to be focused and probing, more interested in what is underneath a statement than in small talk.",
    helps: "What helps with Scorpio is transparency, keeping confidences, and being willing to stay with an intense conversation rather than deflecting it.",
    inLove: "Scorpio tends to love intensely and privately. As a Sun sign it is linked with depth, loyalty and transformation, so a Scorpio partner often wants emotional honesty, commits fully once trust is earned and notices what others try to hide.",
    needs: "Scorpio usually needs trust, depth and a partner who is willing to talk about real feelings rather than surface ones.",
    friction: "When stressed, Scorpio can become guarded, suspicious or controlling, and may test a partner instead of asking directly.",
    frictionShort: "Scorpio's guardedness",
    gift: "Scorpio offers depth, loyalty and emotional honesty.",
    twin: "Two Scorpio Suns often share an intense, private and fiercely loyal bond. Each understands the other's need for depth. The risk is power struggles and mutual suspicion when trust is shaken. Pairs of Scorpio tend to do best when they keep secrets out of the relationship and speak plainly about what they need.",
  },
  Sagittarius: {
    talk: "In conversation, Sagittarius is often frank, philosophical and humorous, more comfortable with big ideas than with careful diplomacy.",
    helps: "What helps with Sagittarius is room to roam, humour during tense moments, and commitments framed as shared adventures rather than limits.",
    inLove: "Sagittarius tends to love with optimism and a sense of adventure. The sign is linked with freedom, honesty and big ideas, so a Sagittarius partner often brings humour, travel, philosophy and a wish to grow together.",
    needs: "Sagittarius usually needs freedom, honesty and a partner who shares its curiosity about the world.",
    friction: "When stressed, Sagittarius can be blunt, restless and inclined to avoid commitments that feel confining.",
    frictionShort: "Sagittarius' need for freedom",
    gift: "Sagittarius offers optimism, humour and a wider horizon.",
    twin: "Two Sagittarius Suns often make an adventurous, funny and freedom-loving pair, always planning the next trip or idea. Honesty comes easily. The risk is that neither attends to the practical or emotional maintenance a relationship needs. Pairs of Sagittarius tend to do best when they treat the relationship itself as part of the adventure.",
  },
  Capricorn: {
    talk: "In conversation, Capricorn tends to be composed and pragmatic, preferring to discuss plans and solutions before feelings.",
    helps: "What helps with Capricorn is respect for its responsibilities, patience while it opens up, and small, steady signs of commitment.",
    inLove: "Capricorn tends to love seriously and with commitment. The sign is linked with discipline, responsibility and ambition, so a Capricorn partner often shows care by building a secure future, keeping promises and offering steady, practical support.",
    needs: "Capricorn usually needs respect, reliability and a partner who understands its long-term goals.",
    friction: "When stressed, Capricorn can become reserved, work-focused and slow to show vulnerability.",
    frictionShort: "Capricorn's reserve",
    gift: "Capricorn offers commitment and a long-term view.",
    twin: "Two Capricorn Suns often form a disciplined, ambitious and loyal partnership with shared goals. Each respects the other's work ethic. The risk is that the relationship becomes all duty and achievement, with little room for play or softness. Pairs of Capricorn tend to do best when they schedule rest and affection as seriously as work.",
  },
  Aquarius: {
    talk: "In conversation, Aquarius is usually inventive and opinionated, enjoying debate and unusual angles more than emotional processing.",
    helps: "What helps with Aquarius is space, intellectual partnership, and inviting feelings in through shared values rather than pressure.",
    inLove: "Aquarius tends to love through friendship and shared ideals. The sign is linked with independence, originality and humanitarian interest, so an Aquarius partner often values intellectual connection, respects a partner's freedom and brings unconventional ideas.",
    needs: "Aquarius usually needs independence, mental stimulation and a partner who is also a friend.",
    friction: "When stressed, Aquarius can become detached, contrarian or emotionally distant.",
    frictionShort: "Aquarius' detachment",
    gift: "Aquarius offers friendship, originality and respect for freedom.",
    twin: "Two Aquarius Suns often share an inventive, independent and friendly partnership. Both value freedom and ideas. The risk is emotional distance, with each assuming the other is fine. Pairs of Aquarius tend to do best when they make warmth as deliberate as their shared interests. Shared volunteering or a joint creative project often gives two Aquarians a way to feel close while doing what they love.",
  },
  Pisces: {
    talk: "In conversation, Pisces tends to be gentle and intuitive, picking up what is unsaid and responding to mood as much as to words.",
    helps: "What helps with Pisces is kindness, patience with its sensitivity, and help turning dreams into a few practical steps.",
    inLove: "Pisces tends to love empathetically and imaginatively. The sign is linked with compassion, creativity and intuition, so a Pisces partner often offers gentleness, romance and a deep sense of emotional understanding.",
    needs: "Pisces usually needs kindness, emotional understanding and a partner who respects its dreams and sensitivity.",
    friction: "When stressed, Pisces can withdraw, avoid hard realities or absorb a partner's mood as its own.",
    frictionShort: "Pisces' tendency to withdraw",
    gift: "Pisces offers compassion, imagination and gentleness.",
    twin: "Two Pisces Suns often create a gentle, imaginative and deeply empathetic bond. Each senses what the other feels. The risk is that both avoid practical matters or conflict, drifting rather than deciding. Pairs of Pisces tend to do best when they share some grounding routines and say clearly what they want.",
  },
};

type ElementTextFn = (a: string, b: string) => string;

/** Keyed by the two elements in alphabetical order; x has the first element, y the second. */
export const ELEMENT_TEXT: Record<string, ElementTextFn> = {
  "Fire|Fire": (x, y) => `${x} and ${y} share the Fire element, which traditional astrology links with enthusiasm, courage and spontaneity. ${x === y ? `Two ${x} Suns` : `${x} and ${y}`} usually recognise each other's energy quickly and enjoy a relationship with movement, warmth and honesty. The shared risk is burnout or heated arguments, since neither ${x} nor ${y === x ? "its twin" : y} naturally cools things down. Fire pairings like this one tend to thrive when they have adventures to share and a habit of pausing before reacting.`,
  "Earth|Fire": (x, y) => `${x} and ${y} combine Earth and Fire, a contrasting pairing in traditional astrology. ${y} brings drive and spontaneity, ${x} brings patience and practicality, so ${y} tends to spark ideas while ${x} gives them form. The friction is usually about pace: ${y} can find ${x} slow, and ${x} can find ${y} reckless. The pairing works best when ${x} and ${y} each treat the other's speed as useful rather than wrong.`,
  "Air|Fire": (x, y) => `${x} and ${y} combine Air and Fire, which astrology treats as complementary elements: air feeds fire. ${y} brings action and passion, ${x} brings ideas and conversation, so time together is often lively, social and stimulating. The risk is that both ${x} and ${y} prefer excitement to follow-through. A pair like ${y} and ${x} tends to do well when it turns shared enthusiasm into a few concrete plans.`,
  "Fire|Water": (x, y) => `${x} and ${y} combine Fire and Water, a contrasting pairing in traditional astrology. ${x} is direct and outward, ${y} emotional and inward, so each can teach the other something but they can also overwhelm each other. ${x} may feel dampened by ${y}'s moods, and ${y} may feel scorched by ${x}'s bluntness. The pairing tends to work when ${x}'s warmth and ${y}'s sensitivity are both treated as strengths.`,
  "Earth|Earth": (x, y) => `${x} and ${y} share the Earth element, which traditional astrology links with practicality, reliability and attention to the physical world. ${x === y ? `Two ${x} Suns` : `${x} and ${y}`} usually agree on the value of security, effort and loyalty, and can build a very stable shared life. The shared risk is stagnation, with routine crowding out spontaneity for ${x === y ? "both partners" : `${x} and ${y}`}. Earth pairings like this tend to thrive when they add small, regular changes on purpose.`,
  "Air|Earth": (x, y) => `${x} and ${y} combine Air and Earth, a contrasting pairing in traditional astrology. ${y} thinks in terms of what is practical and tested, ${x} in terms of ideas and possibilities. That can make a useful partnership of planning and imagination, but it can also produce misunderstandings, with ${y} finding ${x} unreliable and ${x} finding ${y} rigid. Translation between the ${x} style and the ${y} style is the main work.`,
  "Earth|Water": (x, y) => `${x} and ${y} combine Earth and Water, which astrology treats as complementary elements: water nourishes earth. ${x} offers stability and practical care, ${y} offers emotional depth and intuition, so this pairing is often nurturing, loyal and protective. The risk is that ${x} and ${y} both become cautious and inward-looking. An Earth-Water pair like ${x} and ${y} tends to do well when it keeps some outside stimulation in its life.`,
  "Air|Air": (x, y) => `${x} and ${y} share the Air element, which traditional astrology links with ideas, communication and social connection. ${x === y ? `Two ${x} Suns` : `${x} and ${y}`} usually enjoy conversation, shared interests and plenty of mental space. The shared risk is detachment, with feelings discussed in the abstract rather than felt and shown. Air pairings like ${x === y ? `two ${x}s` : `${x} with ${y}`} tend to thrive when they practise naming emotions as clearly as opinions.`,
  "Air|Water": (x, y) => `${x} and ${y} combine Air and Water, a contrasting pairing in traditional astrology. ${x} approaches life through thought and conversation, ${y} through feeling and intuition, so each can broaden the other's understanding. The friction usually appears when ${y} wants emotional reassurance and ${x} offers analysis instead. The pairing works best when ${x} and ${y} both learn to listen in the other's language.`,
  "Water|Water": (x, y) => `${x} and ${y} share the Water element, which traditional astrology links with emotion, intuition and empathy. ${x === y ? `Two ${x} Suns` : `${x} and ${y}`} usually understand each other's feelings deeply and create an intimate, caring bond. The shared risk is emotional overwhelm, with moods amplifying rather than settling between ${x === y ? "the two" : `${x} and ${y}`}. Water pairings like this tend to thrive when they build in practical anchors and some time apart to recharge.`,
};

export const MODALITY_TEXT: Record<string, (a: string, b: string) => string> = {
  "Cardinal|Cardinal": (a, b) => `${a === b ? `Two ${a}s` : `${a} and ${b}`} are both cardinal signs, the signs that open each season. Cardinal energy is associated with initiating, so this pair often shares drive and a preference for taking charge. Two initiators can achieve a lot, as long as they agree on direction and do not start competing over who leads.`,
  "Cardinal|Fixed": (a, b) => `${[a, b].find((s) => CARDINAL.includes(s))} is a cardinal sign and ${[a, b].find((s) => FIXED.includes(s))} is a fixed sign. Cardinal energy starts things and fixed energy sustains them, so one partner tends to propose and the other to commit and persist. The friction comes when the cardinal sign wants a new direction and the fixed sign wants to stay the course.`,
  "Cardinal|Mutable": (a, b) => `${[a, b].find((s) => CARDINAL.includes(s))} is a cardinal sign and ${[a, b].find((s) => MUTABLE.includes(s))} is a mutable sign. Cardinal energy initiates and mutable energy adapts, so this pair often works well when one sets a direction and the other adjusts the details. Tension appears if the cardinal partner feels the mutable one will not commit, or the mutable partner feels pushed.`,
  "Fixed|Fixed": (a, b) => `${a === b ? `Two ${a}s` : `${a} and ${b}`} are both fixed signs, the signs in the middle of each season. Fixed energy is associated with persistence and loyalty, so this pair can be deeply committed and steady. The shared risk is stubbornness: when two fixed signs disagree, neither naturally gives way, so deliberate compromise matters.`,
  "Fixed|Mutable": (a, b) => `${[a, b].find((s) => FIXED.includes(s))} is a fixed sign and ${[a, b].find((s) => MUTABLE.includes(s))} is a mutable sign. Fixed energy holds steady and mutable energy flexes, so each can balance the other. The friction comes when the fixed sign finds the mutable one inconsistent, or the mutable sign finds the fixed one immovable.`,
  "Mutable|Mutable": (a, b) => `${a === b ? `Two ${a}s` : `${a} and ${b}`} are both mutable signs, the signs that close each season. Mutable energy is associated with flexibility and change, so this pair often adapts easily and keeps things fresh. The shared risk is drift: when both prefer to stay open, decisions and commitments can be postponed indefinitely.`,
};

const CARDINAL = ["Aries", "Cancer", "Libra", "Capricorn"];
const FIXED = ["Taurus", "Leo", "Scorpio", "Aquarius"];
const MUTABLE = ["Gemini", "Virgo", "Sagittarius", "Pisces"];

export const SEPARATION_TEXT: Record<number, (a: string, b: string) => string> = {
  0: (a) => `Two ${a} Suns sit at the same point of the zodiac, 0 degrees apart. Traditional astrology treats this like a conjunction at the level of signs: the same element, modality and ruler on both sides, so one ${a}'s values and instincts line up closely with the other ${a}'s. That familiarity can feel easy, and it can also mean that neither ${a} supplies what the other lacks.`,
  30: (a, b) => `${a} and ${b} are neighbouring signs, 30 degrees apart, a relationship sometimes called a semi-sextile. ${a} shares no element or modality with ${b}, so ${a} often sees the world quite differently from ${b} even though the two sit side by side. Astrologers tend to describe ${a} with ${b} as a gentle learning curve, ${a} showing ${b} one step and ${b} showing ${a} another.`,
  60: (a, b) => `${a} and ${b} sit two signs apart, 60 degrees, which matches the sextile in traditional astrology. ${a} belongs to an element that complements ${b}'s, so ${a} and ${b} usually find it easy to cooperate and talk. ${cap(an(`${a}-${b}`))} sextile is often described as friendly and supportive, with opportunities that grow when ${a} and ${b} both put in some effort.`,
  90: (a, b) => `${a} and ${b} sit three signs apart, 90 degrees, which matches the square in traditional astrology. ${a} shares a modality with ${b} but has an element that does not naturally mix with ${b}'s, so ${a} and ${b} often want similar things in different ways. ${cap(an(`${a}-${b}`))} square is often described as dynamic and challenging, friction that can drive growth when ${a} and ${b} handle it with care.`,
  120: (a, b) => `${a} and ${b} sit four signs apart, 120 degrees, which matches the trine in traditional astrology. ${a} shares an element with ${b}, so ${a} and ${b} tend to understand each other's motives and rhythms with little explanation. ${cap(an(`${a}-${b}`))} trine is often described as harmonious and easy, and the main caution is that ease can make ${a} and ${b} take it for granted.`,
  150: (a, b) => `${a} and ${b} sit five signs apart, 150 degrees, which matches the quincunx (also called the inconjunct) in traditional astrology. ${a} shares neither element nor modality with ${b}, so what ${a} needs and what ${b} needs can seem unrelated at first. ${cap(an(`${a}-${b}`))} quincunx is often described as requiring adjustment, with ${a} and ${b} each meeting the other halfway on unfamiliar ground.`,
  180: (a, b) => `${a} and ${b} sit opposite each other, 180 degrees apart, which matches the opposition in traditional astrology. ${a} shares a modality and a complementary element with ${b}, and the two are often read as halves of one theme. ${cap(an(`${a}-${b}`))} opposition can feel magnetic, with ${a} embodying what ${b} is learning and the reverse, and it can polarise when neither meets in the middle.`,
};

export const SEPARATION_PRACTICE: Record<number, (a: string, b: string) => string> = {
  0: (a) => `The practical question for a pair of ${a}s is where variety will come from: friends, interests and Moon or rising signs that differ can all supply it.`,
  30: (a, b) => `In practice, ${a} and ${b} tend to do well when they stop expecting the other to think the same way and get curious about the difference instead.`,
  60: (a, b) => `In practice, ${a} and ${b} tend to reward small, regular effort in each other: shared projects, honest conversation and saying yes to each other's ideas.`,
  90: (a, b) => `In practice, ${a} and ${b} tend to do best when friction is treated as information, with agreed ways to cool down before decisions are made.`,
  120: (a, b) => `In practice, ${a} and ${b} tend to stay strong when both keep choosing growth, so that comfort does not slide into autopilot.`,
  150: (a, b) => `In practice, ${a} and ${b} tend to benefit from explicit agreements, because their instincts about time, money and closeness may not line up naturally.`,
  180: (a, b) => `In practice, ${a} and ${b} tend to thrive when each borrows a little of the other's approach, turning polarity into balance.`,
};

export const RULER_TEXT: Record<string, string> = {
  Mars: "Mars, the planet astrology links with drive, desire and assertion",
  Venus: "Venus, the planet astrology links with love, pleasure and values",
  Mercury: "Mercury, the planet astrology links with thought, speech and exchange",
  Moon: "the Moon, which astrology links with feelings, memory and care",
  Sun: "the Sun, which astrology links with identity, vitality and self-expression",
  Pluto: "Pluto, which modern astrology links with depth, power and transformation",
  Jupiter: "Jupiter, the planet astrology links with growth, meaning and generosity",
  Saturn: "Saturn, the planet astrology links with structure, time and responsibility",
  Uranus: "Uranus, which modern astrology links with change, originality and freedom",
  Neptune: "Neptune, which modern astrology links with imagination, compassion and ideals",
};

/** Day-to-day copy for the fifth section of zodiac pair pages; "{o}" is the partner sign. */
export const SIGN_DAILY: Record<string, { atHome: string; asTeam: string; activity: string; twinMore: string }> = {
  Aries: {
    atHome: "At home, Aries tends to act first and tidy later, starting projects, rearranging furniture and suggesting weekend plans before a {o} partner has finished breakfast.",
    asTeam: "As a teammate, Aries volunteers for the hard first push and the risky pitch; beside a {o}, it does best when someone agrees to carry the work past the exciting opening.",
    activity: "Aries usually enjoys competitive or physical outings: climbing walls, races, martial arts, spontaneous road trips and anything with a little adrenaline",
    twinMore: "Friends often describe a pair of Aries as a whirlwind, arriving late, laughing loudly and already planning the next escapade. Burning bright together is easy for them; resting together takes practice, so lazy mornings deliberately protected from plans can be oddly precious.",
  },
  Taurus: {
    atHome: "At home, Taurus tends to invest in comfort, good bedding, a well-stocked kitchen, plants and music, and it appreciates a {o} who enjoys those pleasures rather than rushing past them.",
    asTeam: "As a teammate, Taurus is steady, patient and hard to rattle; alongside a {o}, it brings follow-through and asks for clear expectations before deadlines move.",
    activity: "Taurus usually enjoys sensory, unhurried outings: long dinners, wine tastings, gardens, concerts, massages and weekends in beautiful, quiet places",
    twinMore: "Two Taurus partners can build a home that feels like a retreat, with familiar rituals, favourite dishes and a sofa nobody wants to leave. Introducing gentle novelty, a new cuisine one month, a different walk the next, keeps all that comfort from hardening into habit.",
  },
  Gemini: {
    atHome: "At home, Gemini tends to fill the place with books, podcasts, gadgets and half-read articles, and it enjoys a {o} who will chat over breakfast and debate over dinner.",
    asTeam: "As a teammate, Gemini networks, explains and juggles; working with a {o}, it shines when it can bounce ideas around and hand detailed execution to someone patient.",
    activity: "Gemini usually enjoys stimulating, varied outings: quizzes, festivals, bookshops, city breaks, lectures, markets and conversations that wander everywhere",
    twinMore: "A pair of Geminis often talk late into the night, finishing each other's sentences and switching topics at dizzying speed. They rarely bore each other. Writing important agreements down, rather than trusting two quick memories, gives this chatty duo a dependable reference point.",
  },
  Cancer: {
    atHome: "At home, Cancer tends to nest, cooking family recipes, keeping photographs on display and making the space feel safe, and it values a {o} who treats home as sacred.",
    asTeam: "As a teammate, Cancer protects colleagues, remembers personal details and senses morale; alongside a {o}, it works best where loyalty is returned and feelings are respected.",
    activity: "Cancer usually enjoys intimate, nostalgic outings: home-cooked dinners, beach walks, family visits, cosy cafés and revisiting meaningful places",
    twinMore: "Two Cancers often create a home brimming with mementoes, comfort food and private jokes. They care for each other instinctively. Because both can sulk silently, agreeing on a gentle phrase that means we need to talk helps this sensitive pair surface hurts before they settle.",
  },
  Leo: {
    atHome: "At home, Leo tends to entertain, decorate boldly and celebrate occasions generously, and it appreciates a {o} who joins the fun and offers praise freely.",
    asTeam: "As a teammate, Leo motivates people, presents confidently and takes pride in the result; next to a {o}, it does best when credit is shared visibly.",
    activity: "Leo usually enjoys glamorous, expressive outings: theatre, dancing, dressing up, hosting parties, sunny holidays and celebrations of any kind",
    twinMore: "Two Leos can make every birthday a gala and every holiday an event, and their mutual admiration is real. The trick is taking turns in the spotlight, cheering as loudly for the other's triumphs as for one's own, so applause never becomes a contest.",
  },
  Virgo: {
    atHome: "At home, Virgo tends to organise, clean, plan meals and fix small problems before they grow, and it values a {o} who notices and appreciates that care.",
    asTeam: "As a teammate, Virgo checks details, improves processes and quietly prevents mistakes; alongside a {o}, it works best when its suggestions are welcomed rather than resented.",
    activity: "Virgo usually enjoys useful, calm outings: hiking, cooking classes, farmers' markets, museums, volunteering and well-planned day trips",
    twinMore: "A pair of Virgos often runs an impeccably organised life, colour-coded calendars, thoughtful gifts and health-conscious menus. What they may forget is play. Leaving a few things deliberately imperfect, and laughing about it, can be the most romantic gesture two perfectionists offer each other.",
  },
  Libra: {
    atHome: "At home, Libra tends to curate beauty and balance, art, flowers and harmonious colours, and it appreciates a {o} who shares decisions and keeps the atmosphere pleasant.",
    asTeam: "As a teammate, Libra mediates, charms clients and finds fair compromises; beside a {o}, it does best when someone helps it commit once options have been weighed.",
    activity: "Libra usually enjoys elegant, social outings: galleries, dinner parties, concerts, shopping for beautiful things and weekends in stylish surroundings",
    twinMore: "Two Libras usually share impeccable taste, gracious manners and a love of company. Their home tends to be lovely and welcoming. Decisions, however, may circle endlessly, so agreeing that whoever cares more decides, and the other gracefully accepts, saves this courteous pair many evenings.",
  },
  Scorpio: {
    atHome: "At home, Scorpio tends to guard privacy, prefer depth to small talk and create a space that feels intimate, and it values a {o} who keeps confidences.",
    asTeam: "As a teammate, Scorpio investigates, strategises and stays focused under pressure; working with a {o}, it does best with trust, autonomy and honest information.",
    activity: "Scorpio usually enjoys intense, absorbing outings: mysteries, thrillers, deep-water swimming, late-night conversations and travel off the beaten path",
    twinMore: "Two Scorpios can share a remarkable, almost wordless intimacy and a fierce loyalty. They also know exactly where each other's sore spots are. Promising never to use that knowledge as a weapon, even in anger, is the pact that lets this intense pair feel completely safe.",
  },
  Sagittarius: {
    atHome: "At home, Sagittarius tends to treat the place as a base camp between adventures, with maps, souvenirs and books, and it appreciates a {o} who does not mind spontaneous departures.",
    asTeam: "As a teammate, Sagittarius brings optimism, vision and candour; next to a {o}, it does best when someone else handles fine print while it rallies enthusiasm.",
    activity: "Sagittarius usually enjoys expansive, adventurous outings: travel, camping, philosophy talks, language classes, horse riding and anything outdoors",
    twinMore: "A pair of Sagittarians often treat life as one long expedition, swapping travel plans and big ideas. They give each other room to roam. Choosing a few shared roots, a home, a garden, a tradition, makes sure two wanderers always have somewhere to come back to together.",
  },
  Capricorn: {
    atHome: "At home, Capricorn tends to keep things orderly and purposeful, with long-term plans for property and savings, and it values a {o} who respects routines and goals.",
    asTeam: "As a teammate, Capricorn manages, plans and delivers; alongside a {o}, it does best with clear roles, realistic timelines and recognition for reliability.",
    activity: "Capricorn usually enjoys purposeful, quality outings: mountain walks, classic restaurants, historical sites, skill-building courses and well-earned quiet breaks",
    twinMore: "Two Capricorns often build a remarkably secure life, shared ambitions, careful budgets and dependable traditions. Respect comes easily. Softness may not, so small, unproductive pleasures, a silly film, breakfast in bed, an afternoon off, deserve a permanent place in their otherwise disciplined calendar.",
  },
  Aquarius: {
    atHome: "At home, Aquarius tends to favour unusual décor, open doors for friends and plenty of independence, and it appreciates a {o} who does not demand constant togetherness.",
    asTeam: "As a teammate, Aquarius innovates, questions assumptions and thinks about the bigger system; working with a {o}, it shines when original ideas are welcomed.",
    activity: "Aquarius usually enjoys inventive, communal outings: tech meetups, science museums, community projects, sci-fi films and eclectic festivals",
    twinMore: "Two Aquarians often share causes, quirky interests and a wide, unconventional friendship circle. They respect each other's freedom completely. The quiet risk is that warmth is assumed, so deliberate affection, a hug, a handwritten note, an unprompted compliment, keeps two independent minds emotionally connected.",
  },
  Pisces: {
    atHome: "At home, Pisces tends to create a soft, dreamy atmosphere with music, art and comfortable corners, and it values a {o} who is gentle and patient with its moods.",
    asTeam: "As a teammate, Pisces offers empathy, imagination and intuition about people; alongside a {o}, it does best with kind leadership and help structuring its creative ideas.",
    activity: "Pisces usually enjoys imaginative, soothing outings: films, art galleries, swimming, live music, poetry readings and quiet time near water",
    twinMore: "A pair of Pisces partners often share an imaginative inner world, music, stories and an instinctive understanding of each other's moods. Practicalities can float away. Sharing a simple weekly routine for bills and plans gives two dreamers solid ground beneath their shared imagination.",
  },
};

export const SIGN_FIRST: Record<string, { first: string; twinRepair: string }> = {
  Aries: { first: "On first meeting, Aries often comes across as bold, funny and refreshingly direct, someone who asks the question everyone else was avoiding.", twinRepair: "Two Aries usually recover from a row quickly, sometimes within minutes, and the healthiest version of this pair apologises just as fast as it flares." },
  Taurus: { first: "On first meeting, Taurus often comes across as calm, warm and grounded, with an unhurried manner that makes people relax.", twinRepair: "Two Taurus partners repair best through shared comfort, a meal or a walk, followed by a calm conversation once both have softened their positions." },
  Gemini: { first: "On first meeting, Gemini often comes across as witty, curious and quick, the person who turns a short chat into an hour of ideas.", twinRepair: "Two Geminis repair best by talking it out thoroughly, then deliberately changing the subject to something light so the conversation ends on a warm note." },
  Cancer: { first: "On first meeting, Cancer often comes across as kind, attentive and a little reserved, warming noticeably once it feels safe.", twinRepair: "Two Cancers repair best with reassurance first, a hug or a kind word, and only then the conversation about what went wrong." },
  Leo: { first: "On first meeting, Leo often comes across as warm, confident and entertaining, with a generous laugh and a natural sense of occasion.", twinRepair: "Two Leos repair best when each acknowledges the other's feelings generously, since pride softens fastest when it is met with warmth rather than argument." },
  Virgo: { first: "On first meeting, Virgo often comes across as thoughtful, modest and observant, offering help before being asked.", twinRepair: "Two Virgos repair best by agreeing on one concrete improvement, then letting the rest go instead of auditing every detail of the disagreement." },
  Libra: { first: "On first meeting, Libra often comes across as charming, polite and easy to talk to, with a gift for putting people at ease.", twinRepair: "Two Libras repair best when one of them names the issue plainly, giving both permission to stop being polite and actually resolve it." },
  Scorpio: { first: "On first meeting, Scorpio often comes across as composed, perceptive and slightly mysterious, giving away less than it notices.", twinRepair: "Two Scorpios repair best through complete honesty, saying the uncomfortable thing directly rather than circling it or keeping score." },
  Sagittarius: { first: "On first meeting, Sagittarius often comes across as cheerful, frank and adventurous, full of stories and plans.", twinRepair: "Two Sagittarians repair best with humour and perspective, followed by an honest word about anything that actually stung." },
  Capricorn: { first: "On first meeting, Capricorn often comes across as composed, capable and dryly funny, quietly assessing the situation.", twinRepair: "Two Capricorns repair best with a practical plan and a softer word than either usually offers, since competence alone rarely heals a hurt." },
  Aquarius: { first: "On first meeting, Aquarius often comes across as friendly, original and a little unpredictable, with surprising opinions.", twinRepair: "Two Aquarians repair best by talking about feelings as directly as they talk about ideas, even when it feels unfamiliar, and by resisting the urge to retreat into separate projects." },
  Pisces: { first: "On first meeting, Pisces often comes across as gentle, dreamy and empathetic, quick to sense how others feel.", twinRepair: "Two Pisces partners repair best with kindness and time, then a clear, practical agreement so the same misunderstanding does not drift back." },
};

/** Keyed like ELEMENT_TEXT; x has the first element alphabetically, y the second. */
export const ELEMENT_DAILY: Record<string, (x: string, y: string) => string> = {
  "Fire|Fire": (x, y) => `In daily rhythm, a household with ${x === y ? `two ${x}s` : `${x} and ${y}`} tends to run hot: early starts, busy weekends and quick decisions. Building in rest days on purpose stops shared enthusiasm from turning into shared exhaustion.`,
  "Earth|Fire": (x, y) => `In daily rhythm, ${y} often wants to go out and do something new, while ${x} wants to finish what is already under way; alternating weekends between the ${y} style and the ${x} style keeps both content.`,
  "Air|Fire": (x, y) => `In daily rhythm, ${y} and ${x} tend to keep a lively, social calendar with plenty of plans and conversation; keeping one evening a week free protects the relationship from becoming all activity and no depth.`,
  "Fire|Water": (x, y) => `In daily rhythm, ${x} tends to want action and ${y} wants emotional connection first; a few minutes of genuine check-in before rushing into the day can satisfy both.`,
  "Earth|Earth": (x, y) => `In daily rhythm, ${x === y ? `two ${x}s` : `${x} and ${y}`} tend to share reliable routines, budgets and household standards. Trying one small new thing each month, a dish, a route, a hobby, keeps that steadiness from becoming a rut.`,
  "Air|Earth": (x, y) => `In daily rhythm, ${y} tends to want structure and ${x} wants flexibility and conversation; a shared calendar with some open slots usually bridges the difference.`,
  "Earth|Water": (x, y) => `In daily rhythm, ${x} and ${y} often create a homely, protective routine with good food and quiet evenings; inviting friends round now and then brings in the outside energy this cosy pairing can lack.`,
  "Air|Air": (x, y) => `In daily rhythm, ${x === y ? `two ${x}s` : `${x} and ${y}`} tend to talk constantly, share articles and plan social events. Pausing to ask how the other actually feels, not just what they think, keeps this pairing emotionally close.`,
  "Air|Water": (x, y) => `In daily rhythm, ${x} often processes the day by talking it through, while ${y} processes by feeling it first; giving each a little space to do it their way prevents crossed wires.`,
  "Water|Water": (x, y) => `In daily rhythm, ${x === y ? `two ${x}s` : `${x} and ${y}`} tend to sense each other's moods closely and share a soft, intimate home life. Practical anchors, a meal plan, a shared to-do list, help when feelings run high on both sides.`,
};

export const MODALITY_CONFLICT: Record<string, string> = {
  "Cardinal|Cardinal": "With two cardinal signs, both partners usually want to fix a disagreement immediately and on their own terms, so agreeing who proposes the solution first is a simple, effective rule.",
  "Cardinal|Fixed": "With a cardinal and a fixed sign, one partner usually wants to resolve things quickly while the other needs time to shift position, so a short pause before deciding often helps both.",
  "Cardinal|Mutable": "With a cardinal and a mutable sign, one partner usually wants a decision and the other wants to keep options open, so naming a decision date keeps both comfortable.",
  "Fixed|Fixed": "With two fixed signs, neither partner gives way easily in an argument, so agreeing in advance that each will concede one point tends to break deadlocks gracefully.",
  "Fixed|Mutable": "With a fixed and a mutable sign, one partner holds a position and the other adapts, so checking that the mutable partner is not always the one bending keeps things fair.",
  "Mutable|Mutable": "With two mutable signs, disagreements can drift without ever being settled, so writing down what was agreed gives this flexible pairing a useful anchor.",
};
