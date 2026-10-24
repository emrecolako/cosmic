/** Hand-written copy for the /zodiac/{sign}-rising pages. */
export interface RisingPageCopy {
  /** 5-12 words, lowercase: the first impression for the one-line answer, e.g. "warmth, presence and a confident, generous manner". */
  gist: string;
  /** Two paragraphs, 95-120 words each: first impressions, manner, how others read this rising sign, the "front door" of the personality. */
  impression: [string, string];
  /** Two paragraphs, 85-110 words each: how this rising sign approaches new situations, challenges and life direction. */
  approach: [string, string];
  /** 85-110 words: its chart ruler (the planet ruling the rising sign) and why that planet's condition matters in a chart, in plain language. */
  ruler: string;
  /** 70-95 words: physical style, energy and presentation as traditionally described (no claims about bodies or health). */
  style: string;
  /** 85-110 words: growth edges, the gap between rising and Sun, practical non-predictive suggestions. */
  growth: string;
  /** One FAQ specific to this rising sign, answer 30-60 words (e.g. "What does Leo rising look like?", "Is Scorpio rising intimidating?"). */
  faq: { question: string; answer: string };
}

export const RISING_PAGES: Record<string, RisingPageCopy> = {
  Aries: {
    gist: "directness, energy and a quick, unguarded readiness to act",
    impression: [
      "Aries rising tends to arrive before it has finished entering the room. The first impression is usually one of speed and candour: a straight look, a quick handshake, an opinion offered before anyone asks for it. Because the ascendant describes the manner a person shows to strangers rather than the whole of who they are, Aries on the eastern horizon at birth is often read as bold even when the inner life is more cautious. People meeting this rising sign tend to sense that something is about to start, and they are often right. There is little performance in it; the front door simply opens fast.",
      "Others usually read Aries rising as confident, sometimes as combative. The manner is direct enough that tact can seem missing, though most of the time the intention is simply clarity. Strangers may find this refreshing in a crowd of polite hedging, or abrupt if they expected small talk first. As the 1st house of the whole sign system, Aries colours how this person starts conversations, projects and friendships: with a push rather than a slow approach. The opposite sign, Libra, sits on the 7th house, which is why partnerships often teach this rising sign the value of a pause, of listening and of the other person's pace.",
    ],
    approach: [
      "New situations tend to be met head-on. Aries rising often prefers to try something and adjust afterwards rather than read every instruction first, and this can make it the person who volunteers, speaks up in the first meeting or takes the unclaimed task. Challenges are frequently treated as invitations. The cardinal fire quality of Aries suggests initiative more than endurance, so the opening burst is usually strong. What follows depends on whether the rest of the chart supplies patience, because this ascendant on its own is more interested in beginning things than in maintaining them.",
      "Life direction, for this rising sign, is often found by doing. Plans may change quickly once experience shows a better route, and long periods of indecision tend to feel worse than a wrong turn. Many Aries risings describe needing a goal they can see and a reason to move towards it. Competition can sharpen focus, though the most satisfying contest is often with their own previous best. When stuck, the instinct is to act anyway, which sometimes works and sometimes simply creates motion. Learning to tell those two apart is part of how this ascendant matures.",
    ],
    ruler:
      "With Aries rising, the chart ruler is Mars. Because the ruling planet of the ascendant acts as a kind of guide to the whole chart, the sign and house Mars occupies show where this person's energy most naturally goes and how it is expressed. Mars in a patient earth sign may slow the Aries front door into something steadier; Mars in another fire sign tends to amplify it. The house holding Mars often points to the life area where effort, drive and occasional conflict concentrate. Astrologers read aspects to Mars as well, since tense contacts can sharpen the temper and flowing ones can channel it.",
    style:
      "Traditionally, Aries rising is linked with a brisk, purposeful presentation: a quick stride, an alert expression and clothes chosen for movement over ornament. Many astrologers describe a forward-leaning energy, as though the person is already halfway to the next thing. Bright colour and sharp lines suit the sign's reputation. The overall impression is of someone practical and ready, more likely to roll up sleeves than to arrange them neatly. None of this describes a fixed look; it is a style tendency rather than a rule.",
    growth:
      "The growth edge for Aries rising is often the space between impulse and response. The ascendant can make a person seem more certain than they feel, and when the Sun sits in a quieter sign the gap can be confusing: others expect the bold opener, while the core wants time. Noticing that difference helps. Practical ideas include counting a beat before replying in heated moments, finishing one project before announcing the next, and asking a question where a statement would usually come first. Treating patience as a skill to build, rather than a weakness, tends to suit this rising sign.",
    faq: {
      question: "Is Aries rising aggressive?",
      answer:
        "Not necessarily. Aries rising is usually described as direct, energetic and quick to act, and that pace can read as aggressive to people who expect a slower approach. Much depends on Mars, the chart ruler, and on the rest of the chart. Often the edge softens once people know the person.",
    },
  },
  Taurus: {
    gist: "calm, steady warmth and an unhurried, grounded presence",
    impression: [
      "Taurus rising usually makes a quiet first impression that lingers. There is a settledness to the manner, as though this person has already decided to stay a while, and strangers often find themselves relaxing in response. The ascendant is the sign that was rising on the eastern horizon at the moment of birth, so it shapes the outer style rather than the core, and here that style is calm, sensory and unrushed. People with this placement rarely hurry an introduction. They tend to observe first, offer a small kindness, and let trust build at its own natural speed rather than force it.",
      "Others tend to read Taurus rising as reliable, patient and pleasant company. The voice may be measured, the humour dry, the reactions slow enough that people wonder whether they have been heard. They usually have. Because the rising sign forms the 1st house in whole sign houses, Taurus here frames how the self is presented: solid, tactile and attentive to comfort. Scorpio then falls on the 7th house, which suggests that close partners often bring intensity, depth or emotional complexity that this placid exterior would not choose alone, and much of the growth happens there.",
    ],
    approach: [
      "Faced with something unfamiliar, Taurus rising usually wants to test the ground before stepping onto it. Questions come first: what does this cost, how long will it take, what is the realistic outcome? This is not reluctance so much as a preference for building on what is known to hold. As a fixed earth sign, Taurus is linked with endurance, and once this rising sign commits it tends to keep going long after more excitable types have moved on. Difficulty is often handled by slowing down and simplifying until the next practical step becomes obvious.",
      "Direction in life tends to emerge gradually for this ascendant. Rather than a dramatic calling, there is often a steady accumulation of skills, resources and relationships that eventually form a shape. Taurus rising people frequently value security enough to stay with a path that works, and they may change course only when the case for it is overwhelming. The upside is depth and consistency. The risk is staying put out of habit rather than choice. Periodically asking whether a routine still serves its purpose helps keep stability from turning into inertia.",
    ],
    ruler:
      "Venus is the chart ruler for Taurus rising. Since the planet ruling the ascendant is read as the steering point of the chart, the sign and house Venus occupies say a great deal about where this person seeks pleasure, value and ease. Venus in a fiery sign can make the calm exterior more expressive; Venus in an air sign may add sociability and talk. The house it falls in often shows what this person spends time and care on. Aspects to Venus also matter, because they describe whether the drive towards comfort and beauty flows smoothly or meets friction.",
    style:
      "Traditionally, Taurus rising is associated with a pleasant, composed presence and a strong sense of texture: good fabrics, earthy colours, things that feel nice as well as look nice. The movement is often described as unhurried and deliberate. Many astrologers note an appreciation for quality over novelty, so the wardrobe may be small but well chosen. A soft speaking voice and a liking for scent, flowers or music are often mentioned. As always, this is the traditional picture, not a description of any particular person.",
    growth:
      "For Taurus rising, growth often involves flexibility. The calm manner can hide a stubborn streak, and people may not see the resistance until a change is already being refused. When the Sun sign is restless, such as Gemini or Sagittarius, others may misjudge how much variety this person needs, and the person may misjudge it too. Useful practices include trying one small new thing each week, naming preferences early instead of quietly digging in, and reviewing habits once in a while. Change taken in manageable portions tends to feel safer for this ascendant.",
    faq: {
      question: "What does Taurus rising look like?",
      answer:
        "Taurus rising is traditionally described as calm, composed and quietly attractive, with an unhurried way of moving and an eye for quality and texture in clothes. The overall impression is of steadiness and comfort. Venus, the chart ruler, adds individual detail depending on its sign and house.",
    },
  },
  Gemini: {
    gist: "curiosity, quick talk and a light, adaptable sociability",
    impression: [
      "The first thing many people notice about Gemini rising is movement: eyes that scan the room, hands that help with the sentence, a question asked almost before the greeting is finished. The rising sign is set by the exact birth time and place, changing roughly every two hours, and when Gemini held that eastern position the outer manner tends to be inquisitive and nimble. Conversation is the usual entry point. This ascendant often gives an impression of youthfulness and wit, and strangers may come away feeling they had a lively exchange even if they learned little about the person underneath.",
      "Others usually read Gemini rising as friendly, clever and easy to talk to, sometimes as hard to pin down. The front door swings open readily, yet it can be difficult to tell how far in anyone has actually been invited. With Gemini as the 1st house in whole sign houses, Sagittarius falls on the 7th, which often draws partners who bring big-picture beliefs, adventure or a philosophy that asks the Gemini rising to commit to a view. The lightness that charms strangers can be mistaken for shallowness, though the curiosity behind it is usually genuine and wide-ranging.",
    ],
    approach: [
      "A new situation, for Gemini rising, is mostly a set of things to find out. Information comes first: who is here, what is happening, what are the options? This rising sign tends to gather a wide range of inputs quickly and to adapt as it learns. Being mutable air, Gemini is linked with flexibility of mind, and challenges are often approached by talking them through, reading around them or trying several solutions at once. The difficulty, when it arises, is usually with depth: staying with one problem long enough after the interesting part has faded.",
      "Many Gemini risings describe their direction as a series of chapters rather than a single road. Interests multiply, jobs may combine several roles, and a varied life can feel more natural than a narrow specialism. That variety is a strength when it connects ideas others keep separate. It can also scatter effort. Some people with this ascendant find it helpful to keep one steady thread running through the changes, whether a craft, a relationship or a practice, so that curiosity has somewhere to return to and slowly accumulate.",
    ],
    ruler:
      "Gemini rising is ruled by Mercury, which makes Mercury the chart ruler. Because the ascendant's ruler acts like a lead character in the chart, the sign and house of Mercury show how this person's thinking and communicating actually work beneath the chatty surface. Mercury in a water sign can bring more feeling to the words; Mercury in an earth sign may slow them into something practical. The house it sits in often points to the subject this person cannot stop talking about. Mercury's aspects describe whether the mind runs smoothly, races ahead or meets resistance.",
    style:
      "Traditionally, Gemini rising is associated with a lively, youthful presentation and expressive hands and face. Clothing may change with mood, mixing styles or following whatever has caught the person's interest that month. Astrologers often describe quick, light movement and a tendency to fidget when bored. Accessories that carry a story, such as a book in the bag or a notebook in a pocket, suit the sign's reputation. The energy is talkative and alert, more like a conversation in motion than a fixed image.",
    growth:
      "The growth edge for Gemini rising often involves depth and follow-through. The ascendant's quick charm can make a person look more casual than they are, so when the Sun falls in a serious sign like Capricorn or Scorpio, others may underestimate the commitment underneath. Practical suggestions include finishing a book before starting another, letting silences sit in conversation, and choosing one or two subjects to go further with each year. Writing things down can also help, giving the restless mind a place to set its ideas down and return to them later.",
    faq: {
      question: "Is Gemini rising two-faced?",
      answer:
        "That label is unfair. Gemini rising is usually described as adaptable, curious and socially quick, which can look inconsistent when the person adjusts tone for different company. Usually it reflects range rather than deceit. Mercury, the chart ruler, and the Sun sign add useful context.",
    },
  },
  Cancer: {
    gist: "gentle attentiveness, protectiveness and a warm but guarded manner",
    impression: [
      "Cancer rising often greets the world with a soft voice and a careful eye. There is warmth in the manner, but it is the warmth of someone checking whether the room is safe before fully settling in. Because the ascendant describes the instinctive way a person meets strangers, Cancer here tends to produce a first impression of kindness held slightly in reserve. People frequently feel looked after in this company: offered a seat, a drink, a question about how they are really doing. What they may not see straight away is how much the Cancer rising is reading the emotional weather underneath.",
      "Others usually read this rising sign as caring, sensitive and approachable, sometimes as moody when the shell closes. Trust opens it up. Once someone is inside the circle, Cancer rising can be fiercely loyal, funny and deeply attentive to small details of other people's lives. With Cancer on the 1st house, Capricorn falls on the 7th, so partnerships often bring structure, ambition or a calm reserve that balances the emotional responsiveness of this ascendant. The front door here is a family home's door: welcoming to guests, firmly closed to anyone who seems unkind or careless with confidences.",
    ],
    approach: [
      "When something new arrives, Cancer rising tends to approach sideways. The first move is often to gauge feelings, both its own and other people's, before committing to an obvious plan. Cancer is a cardinal water sign, which suggests initiative of an emotional kind: starting things because they matter to someone. Challenges are frequently handled through protective instinct. If a project, a friend or a family member needs defending, this rising sign can move with surprising force. When the threat is personal criticism, though, the reaction may be withdrawal before return.",
      "Life direction for Cancer rising is often tied to belonging. Choices about work, place and people tend to circle back to questions of home, family and security, whether that means a literal household or a team that feels like one. This ascendant may be drawn to roles that involve care, memory or keeping something safe. Changes of direction are usually felt deeply. A helpful habit for many is keeping a familiar anchor, such as a routine, a place or a ritual, during periods of transition, so that the new can be met from somewhere secure.",
    ],
    ruler:
      "The Moon is the chart ruler for Cancer rising. Since the luminary ruling the ascendant leads the whole chart, the Moon's sign and house carry unusual weight here, showing where this person seeks comfort and how emotions are actually processed. The Moon in a fire sign can make the gentle exterior more spirited; the Moon in an air sign may add detachment or a need to talk feelings through. Its house often points to the area of life that feels most like home. Because the Moon moves quickly, its phase at birth and its aspects are also read closely.",
    style:
      "Traditionally, Cancer rising is linked with a soft, approachable look and an expressive, changeable face that shows mood readily. Clothes are often chosen for comfort and familiarity, with a fondness for keepsakes, family pieces or soft fabrics. Many astrologers describe a protective posture in unfamiliar settings and a visible relaxing once among friends. Pale or watery colours fit the sign's reputation. The overall presentation tends to feel nurturing and gentle rather than showy, more invitation than announcement.",
    growth:
      "For Cancer rising, the edge is often learning to stay open without feeling exposed. The protective shell can come down too early, leaving others confused about what went wrong. When the Sun is in a bolder sign such as Leo or Aries, the gap can be striking: the person wants to lead but meets the world tentatively. Useful approaches include naming hurt directly instead of retreating, building routines that refill emotional reserves, and checking whether a perceived slight was intended at all. Care given to oneself tends to steady the care given to others.",
    faq: {
      question: "Is Cancer rising shy?",
      answer:
        "Cancer rising can seem shy at first because it reads the room before relaxing. Once trust forms, the manner is often warm, funny and highly attentive. The sign and house of the Moon, the chart ruler, show how quickly this softening happens in a given chart.",
    },
  },
  Leo: {
    gist: "warmth, presence and a confident, generous manner",
    impression: [
      "Leo rising tends to be noticed. Not always through volume, but through a kind of glow: an open face, a ready laugh, a way of standing as if the light finds them naturally. The ascendant marks the sign that was coming up over the eastern horizon at birth, and with Leo there the first impression usually carries dignity and warmth together. Strangers often feel welcomed, even made to feel a little special. There is often pride in how this person presents, and a real pleasure in making an entrance that lifts the mood of everyone already in the room.",
      "People typically read Leo rising as confident, generous and fun, and sometimes as proud. The manner invites attention, and the person usually returns it with interest, praising others, remembering names, turning a small gathering into an occasion. Behind that, many Leo risings care greatly about being respected, so a careless remark can sting more than it shows. With Leo as the 1st house, Aquarius sits on the 7th, which suggests that partners often bring independence, friendship and a cooler perspective that asks this warm ascendant to share the stage now and then, and to enjoy applause that is not its own.",
    ],
    approach: [
      "Leo rising tends to meet new situations with the intention of making something good of them. There is a creative instinct here, a wish to put a personal stamp on whatever is being built. As a fixed fire sign, Leo is associated with steady heat rather than sudden sparks, so commitment, once given, tends to be wholehearted and lasting. Challenges are often taken personally, in the sense that this ascendant wants to rise to them and be seen doing so. Encouragement makes a large difference; a supportive audience can bring out the best in this placement.",
      "Life direction often involves expression of some kind. Leo rising people frequently gravitate to roles where they can lead, perform, teach or create, and they tend to be happiest when their contribution is visible and valued. That does not mean a need for fame; it can be as simple as being the person a family or team turns to. The risk is tying self-worth too tightly to recognition. Finding sources of meaning that hold steady whether anyone is watching can make the path feel more secure over time.",
    ],
    ruler:
      "Leo rising is ruled by the Sun, so the Sun becomes the chart ruler as well as the core of identity. This doubles its importance: the Sun's sign and house describe both who the person is and where their life tends to be steered. If the Sun sits in a quiet sign such as Virgo or Pisces, the bright Leo front door may hide a more modest nature. The house it occupies often shows where this person most wants to shine. Aspects to the Sun describe whether confidence flows freely or has to be earned through effort.",
    style:
      "Traditionally, Leo rising is linked with a striking presentation: hair that receives attention, a warm smile and an upright, confident bearing. Many astrologers describe a liking for rich colours, gold tones and pieces that make a statement. Movement is often unhurried and graceful, as though the person expects to be seen and is comfortable with it. Even a casual outfit may carry one dramatic detail. This is the traditional portrait, offered as a style tendency rather than a description of anyone's appearance.",
    growth:
      "Growth for Leo rising often starts with letting others be the centre. The ascendant's warmth is real, but it can fill a room without meaning to. When the Sun falls in a reserved sign, the person may feel pressure to keep performing a confidence that does not match their mood. Practical ideas include asking more questions than one answers in a conversation, celebrating other people's wins openly, and allowing off days without apology. Pride softened by humour tends to make this rising sign both easier to know and easier to live with from the inside.",
    faq: {
      question: "What does Leo rising look like?",
      answer:
        "Leo rising is traditionally described as warm, upright and noticeable, with expressive hair, a broad smile and a confident way of moving. People often remember meeting them. The Sun, as chart ruler, adds individual detail through its sign and house placement.",
    },
  },
  Virgo: {
    gist: "attentive precision, modesty and a quietly helpful manner",
    impression: [
      "Virgo rising often makes its first impression through attention to detail. The handshake is considerate, the questions are specific, and the person may notice what is out of place before they notice anything else. The ascendant is the 1st house in a whole sign chart and describes how someone approaches the world at first contact; with Virgo there, that approach is careful, observant and modest. Strangers often find this rising sign easy to underestimate. It does not push for attention, yet by the end of a meeting it has usually understood more than anyone else present.",
      "Others tend to read Virgo rising as competent, polite and slightly reserved, sometimes as critical. The critical edge usually comes from a wish to improve things rather than to judge people, though it can land harder than intended. Helpfulness is often the first language: offering to fix, tidy or explain. Pisces falls on the 7th house in this system, which suggests that partners often bring imagination, softness or a vague, flowing quality that asks the Virgo rising to accept what cannot be organised. That contrast tends to be one of this ascendant's most important lessons.",
    ],
    approach: [
      "Virgo rising usually meets a new situation by looking for the system inside it. What are the steps, what could go wrong, how can it be done properly? Being a mutable earth sign, Virgo is associated with adaptable practicality, so plans are revised as new information comes in. Challenges are frequently broken into manageable parts and solved one at a time. The strength is thoroughness. The struggle, when it shows up, is perfectionism: waiting until something is flawless before beginning, or worrying that a small error has spoiled the whole.",
      "Direction in life often comes through usefulness. Virgo rising people frequently find meaning in skill, service and the satisfaction of a job done carefully, and they may build a path by becoming quietly indispensable. The order of routines, workflows and daily structure often matters a great deal to them. Large, vague ambitions can feel uncomfortable unless they are translated into concrete tasks. A helpful practice is to measure progress by improvement rather than by perfection, so that steady effort is recognised even while the work remains unfinished.",
    ],
    ruler:
      "For Virgo rising, Mercury is the chart ruler. Because the ascendant's ruler sets the direction of the chart, Mercury's sign and house reveal how this careful exterior actually thinks and where attention is drawn. Mercury in a fire sign can make the reserved Virgo manner quicker and bolder in speech; Mercury in a water sign may make it more intuitive and less exacting. The house it falls in often shows the area of life where analysis is most concentrated. Aspects to Mercury indicate whether thinking flows calmly or tends towards worry and overanalysis.",
    style:
      "Traditionally, Virgo rising is linked with a neat, understated presentation: clean lines, sensible fabrics and an outfit that has been thought through without looking fussy. Many astrologers describe a fresh, composed appearance and an attentive, slightly reserved expression. Natural colours and practical accessories fit the sign's reputation. Movement tends to be precise and economical. The look is often described as polished in a quiet way, the kind of style that rewards a second glance rather than demanding a first.",
    growth:
      "The growth edge for Virgo rising often lies in self-acceptance. The ascendant's habit of noticing what could be better is valuable, but turned inward it can become harsh. When the Sun sits in a more expansive sign such as Sagittarius or Leo, the person may feel boxed in by their own carefulness. Useful practices include setting deadlines that accept a good-enough result, naming three things that went well before reviewing what did not, and letting others help. Kindness towards one's own mistakes tends to make this rising sign's gifts easier to share.",
    faq: {
      question: "Is Virgo rising critical?",
      answer:
        "Virgo rising can seem critical because it notices details and wants things done well. Usually that attention is meant as help rather than judgement. Mercury, the chart ruler, and the Sun sign shape how gently or sharply that observant streak is expressed in practice.",
    },
  },
  Libra: {
    gist: "grace, diplomacy and a charming, agreeable social ease",
    impression: [
      "Libra rising usually opens with charm. The smile comes easily, the tone adjusts to the listener, and there is often an instinct for putting people at ease that feels almost effortless. Since the rising sign governs the outward style of approach rather than the deeper motivations, Libra on the ascendant tends to create an impression of balance and pleasantness even when the person feels unsettled within. Strangers may describe this person as lovely to talk to, considerate and fair-minded. Rough edges, if they exist, are rarely visible in a first meeting, and disagreement tends to arrive wrapped in courtesy.",
      "Others usually read Libra rising as diplomatic, attractive and sociable, sometimes as indecisive. The desire to keep things harmonious can make strong opinions slow to surface, and people may not realise how firmly this ascendant holds a view until a line is crossed. With Libra on the 1st house, Aries sits on the 7th, so partners often arrive with directness, energy and a willingness to clash that Libra rising tends to avoid. That opposite pull can be both attractive and challenging. The front door here is beautifully kept, and visitors are always asked how they are.",
    ],
    approach: [
      "New situations, for Libra rising, are often weighed through relationships. Who is involved, how will people feel, what would be fair? This ascendant tends to look at a problem from several angles and seek the outcome that serves the most people. Libra is a cardinal air sign, linked with initiative through ideas and connection, so it often starts things by bringing people together. Challenges that involve conflict can be uncomfortable, and the first instinct may be to smooth them over. The skill, over time, is learning when peace is real and when it is only postponed.",
      "Life direction often develops in partnership. Libra rising people frequently do their best work alongside others, whether a business partner, a creative collaborator or a close team. Aesthetics, fairness and good design may also shape the path. The risk is outsourcing decisions, waiting for someone else to choose so that nobody is disappointed. Making small choices quickly, and noticing afterwards that the world did not fall apart, can build the confidence to make larger ones. Clarity about personal preferences tends to strengthen rather than threaten relationships.",
    ],
    ruler:
      "Libra rising is ruled by Venus, which then becomes the chart ruler. The ascendant's ruler is often described as the chart's steering wheel, so the sign and house of Venus show where this graceful exterior directs its energy. Venus in an earth sign can add practicality and a steadier sense of value; Venus in a water sign may make the charm more emotional and private. The house it sits in often shows where harmony matters most. Aspects to Venus help describe whether relationships and pleasures flow freely or call for effort and negotiation.",
    style:
      "Traditionally, Libra rising is associated with a pleasing, well-proportioned presentation and a strong eye for colour, cut and coordination. Many astrologers describe an attractive smile and a graceful manner of moving. Outfits are often chosen with care, favouring elegance and balance over anything harsh or extreme. Soft pastels and refined accessories fit the sign's reputation. The impression tends to be of someone who has considered how they appear and wants the people around them to feel comfortable too.",
    growth:
      "For Libra rising, growth often involves risking disagreement. The ascendant's diplomacy is a genuine gift, but it can bury needs that later surface as resentment. When the Sun sits in a forthright sign such as Scorpio or Capricorn, people may be surprised by the steel behind the pleasant manner. Practical ideas include stating a preference first instead of waiting to hear everyone else's, practising a kind but clear no, and remembering that fairness includes fairness to oneself. Honest friction, handled gracefully, tends to strengthen this rising sign's relationships.",
    faq: {
      question: "Is Libra rising indecisive?",
      answer:
        "Libra rising is often described as weighing options carefully because it wants outcomes to be fair and harmonious. That can look like indecision. With practice, many become thoughtful decision-makers. Venus, the chart ruler, shows how strongly that tendency appears in any one chart.",
    },
  },
  Scorpio: {
    gist: "intensity, privacy and a magnetic, watchful reserve",
    impression: [
      "Scorpio rising often makes an impression that is felt before it is understood. The gaze tends to be steady, the speech economical, and there is a sense of something being held back that draws people in rather than pushing them away. The ascendant is the sign rising at the exact moment and place of birth, and Scorpio there tends to give the outward manner a quiet intensity. Small talk is rarely the goal. Strangers may sense that they are being read carefully, and they are usually right; this rising sign gathers information long before it gives any away.",
      "Others tend to read Scorpio rising as magnetic, private and sometimes intimidating. The reserve is often protective rather than cold, and people who earn trust frequently find a loyal, perceptive and darkly funny companion behind it. Opinions can be strong but are seldom offered casually. With Scorpio on the 1st house, Taurus falls on the 7th, which suggests partners who bring steadiness, sensuality and calm reliability, offering a resting place for this ascendant's intensity. The front door here is solid, unmarked and opened only to those who knock with sincerity and patience, though it stays open once they are in.",
    ],
    approach: [
      "When something new comes along, Scorpio rising tends to look beneath the surface first. What are the motives, the hidden costs, the real power dynamics? As a fixed water sign, Scorpio is associated with emotional depth and staying power, so once this ascendant decides something matters, it can commit with remarkable focus. Challenges are often faced privately. The person may say little while working hard on a problem, and then reveal a solution fully formed. Setbacks can be absorbed deeply, but they also tend to become fuel for transformation.",
      "Life direction for Scorpio rising often involves cycles of ending and renewal. Interests that look like obsessions to outsiders can be part of how this person finds meaning: going all the way into a subject, a relationship or a craft. Superficial paths tend to feel unsatisfying. Some describe needing a few defining turning points before the direction became clear. A helpful approach is to allow chapters to close without treating every ending as a loss, since this rising sign often grows most through letting go of what has run its course.",
    ],
    ruler:
      "Scorpio rising has Pluto as its modern chart ruler, with Mars as its traditional ruler, and astrologers often read both. Because the ascendant's ruler guides the chart's story, the signs and houses of these planets show where this person's intensity is focused. Pluto moves slowly, so its sign is shared by a whole generation, which makes its house and aspects more personal than its sign. Mars adds detail about drive and assertion. When either planet touches the Sun, Moon or ascendant, the Scorpio quality of depth is usually felt more strongly.",
    style:
      "Traditionally, Scorpio rising is associated with a striking, self-contained presentation: a penetrating gaze, a composed expression and an air of mystery. Many astrologers note a preference for dark colours, simple lines and clothes that conceal more than they reveal. Movement can be described as controlled and deliberate. There is often a quiet magnetism that does not depend on effort. This is the traditional image of the sign, a style tendency rather than any claim about how a person looks.",
    growth:
      "Growth for Scorpio rising often involves letting others see more. The protective reserve keeps vulnerability safe, but it can also keep good people at a distance. When the Sun sits in an open sign such as Sagittarius or Gemini, the guarded front door can hide a playful nature others never meet. Useful practices include sharing one honest feeling earlier than feels comfortable, giving people the benefit of the doubt once, and noticing when suspicion is a habit rather than a signal. Trust extended carefully tends to reward this rising sign.",
    faq: {
      question: "Is Scorpio rising intimidating?",
      answer:
        "Scorpio rising can seem intimidating because of its steady gaze, reserved manner and reluctance to share personal details early. Most of that is protective caution rather than hostility. Once trust is established, it is often described as loyal, warm and perceptive.",
    },
  },
  Sagittarius: {
    gist: "optimism, openness and a friendly, adventurous frankness",
    impression: [
      "Sagittarius rising tends to arrive with a story. The manner is friendly, frank and often funny, as though every introduction might lead somewhere interesting. Because the rising sign shapes the outer approach rather than the whole personality, Sagittarius on the ascendant usually gives the first impression of enthusiasm and openness, even when the person feels unsure inside. Strangers often relax quickly in this company. There is little stiffness or formality, and conversations may roam from travel to philosophy to a terrible joke within a few minutes, with laughter rarely far away and an invitation to some new plan often tucked in at the end.",
      "Others usually read Sagittarius rising as optimistic, generous and adventurous, sometimes as tactless. Honesty comes out before it has been edited, and while the intent is rarely unkind, the bluntness can surprise. People often find this ascendant inspiring, someone who makes plans sound possible. With Sagittarius as the 1st house, Gemini sits on the 7th, so partners frequently bring curiosity, detail and lively talk that sharpens the Sagittarius rising's big ideas. The front door here is often wide open, sometimes with a packed bag waiting just beside it and a map spread on the table, ready for whoever wants to come along.",
    ],
    approach: [
      "Sagittarius rising meets new situations as possible adventures. The instinct is to say yes, explore and find meaning in whatever appears. Being mutable fire, Sagittarius is linked with enthusiasm that adapts, so plans can shift as fresh options appear. Challenges are often reframed as lessons, which helps this ascendant recover quickly from disappointment. The downside is occasional overreach: committing to more than time allows, or skipping details in favour of the big picture. Learning which promises to keep and which to decline tends to refine the natural optimism.",
      "Life direction for this ascendant is often shaped by belief and exploration. Travel, education, teaching, publishing or any path that widens horizons may appeal, and many Sagittarius risings describe needing a sense of purpose more than a precise plan. Restriction can feel suffocating. That said, freedom without some structure can scatter energy across too many beginnings. Choosing a guiding principle and checking decisions against it, rather than against the excitement of the moment, can help this rising sign find a path that keeps expanding without losing its shape.",
    ],
    ruler:
      "Jupiter is the chart ruler for Sagittarius rising. As the planet ruling the ascendant, Jupiter's sign and house describe where this person's optimism, generosity and appetite for growth are directed. Jupiter in an earth sign can ground the open manner into practical ambition; Jupiter in a water sign may turn the search for meaning inward and emotional. The house it occupies often points to the area of life where luck and enthusiasm seem to gather. Aspects to Jupiter show whether expansion comes easily or needs pacing and restraint.",
    style:
      "Traditionally, Sagittarius rising is associated with a relaxed, outdoorsy presentation and an animated, friendly face. Many astrologers describe a long stride, expressive gestures and a fondness for comfortable clothes suited to moving about. Pieces gathered on travels or chosen for their story often appear. The overall energy tends to be informal and good-humoured, more interested in freedom of movement than polish. Like all descriptions of the ascendant, this is a traditional picture, not a rule.",
    growth:
      "The growth edge for Sagittarius rising often lies in attention to detail and follow-through. The ascendant's enthusiasm draws people in, but promises made in the excitement of the moment can be hard to keep. When the Sun sits in a cautious sign such as Cancer or Virgo, others may expect more boldness than the person truly feels. Practical ideas include writing down commitments before agreeing to new ones, pausing before blunt remarks, and finishing what was started even when interest dips. Freedom tends to feel richer when it rests on reliability.",
    faq: {
      question: "What does Sagittarius rising look like?",
      answer:
        "Sagittarius rising is traditionally described as open, animated and friendly-looking, with a long stride, expressive gestures and relaxed, practical clothing. The overall impression is of someone ready for adventure. Jupiter, the chart ruler, adds individual variation depending on its sign and house.",
    },
  },
  Capricorn: {
    gist: "composure, reliability and a serious, capable reserve",
    impression: [
      "Capricorn rising usually makes a composed first impression. The manner tends to be polite, measured and a little formal, as though the person is assessing what the situation requires before relaxing. The ascendant describes the instinctive way someone steps into new company, and with Capricorn rising at birth that step is often careful and responsible. Strangers may read maturity beyond the person's years. Humour is present but usually dry, offered once trust is established. There is a sense of quiet authority, even when this person is not in charge of anything at all, and others often turn to them anyway.",
      "Others usually read Capricorn rising as competent, reserved and dependable, sometimes as distant. The reserve can come from a wish not to waste anyone's time, or from a feeling that respect should be earned before warmth is shown. Once that happens, this rising sign is often loyal, practical and unexpectedly playful. With Capricorn on the 1st house, Cancer occupies the 7th, which suggests partners who bring emotional warmth, nurture and a sense of home that softens this ascendant's seriousness. The front door here is sturdy, well maintained and sensibly locked, with a warm hallway behind it for those who are let in.",
    ],
    approach: [
      "Capricorn rising meets new situations by asking what needs to be done and who is responsible. Structure is reassuring, and this ascendant often brings it where none exists. As a cardinal earth sign, Capricorn is associated with practical initiative, starting things that are meant to last. Challenges tend to be treated as tests of endurance. The person may quietly take on more than their share, keep going through difficulty and only later admit how heavy the load was. Patience is a real strength here, though so is the risk of overwork.",
      "Direction in life often involves long-term goals. Capricorn rising people frequently describe feeling that they started serious and grew lighter with time, finding more freedom as their competence became established. Careers, reputations and responsibilities may be built slowly and steadily. The risk is postponing enjoyment until some distant point of having made it. Building rest and pleasure into the schedule now, rather than treating them as rewards, can make the climb more sustainable and the view from higher up more enjoyable. Achievement shared with people who matter tends to feel more complete.",
    ],
    ruler:
      "With Capricorn rising, Saturn is the chart ruler. Because the ascendant's ruler directs the chart's narrative, Saturn's sign and house show where this person's discipline, caution and ambition are channelled. Saturn in a fire sign can add courage to the composed exterior; Saturn in an air sign may make the seriousness more intellectual. The house Saturn occupies often points to the life area where effort is most demanding and most rewarding over time. Aspects to Saturn describe whether structure supports this person or feels like a weight to carry.",
    style:
      "Traditionally, Capricorn rising is associated with a classic, understated presentation: tailored lines, dark or neutral colours and pieces chosen for quality and longevity. Many astrologers describe an upright bearing, a composed expression and a manner that grows warmer with familiarity. The look tends to be practical and polished, the kind of style that signals reliability. A sense of seeming slightly older when young, and slightly younger when older, is often mentioned in traditional sources.",
    growth:
      "Growth for Capricorn rising often involves allowing softness. The ascendant's composure can make others assume everything is under control, so help may not be offered when it is needed. When the Sun sits in an emotional or playful sign such as Pisces or Leo, the formal front door can hide a great deal of feeling. Useful practices include asking for support before reaching exhaustion, sharing small successes with friends, and scheduling unstructured time that has no purpose beyond enjoyment. Lightness taken seriously tends to balance this rising sign well.",
    faq: {
      question: "Is Capricorn rising cold?",
      answer:
        "Capricorn rising can seem cold at first because it tends to be reserved, formal and careful with strangers. That reserve usually reflects caution and responsibility rather than lack of feeling. Over time, many Capricorn risings show dry humour, loyalty and warmth.",
    },
  },
  Aquarius: {
    gist: "friendly independence, originality and a cool, curious detachment",
    impression: [
      "Aquarius rising often makes an impression that is friendly yet hard to categorise. The manner is open, curious and egalitarian, treating the stranger at the party and the host in much the same way. Because the ascendant is set by the sign rising on the eastern horizon at birth, Aquarius there tends to colour the outer style with a slightly unusual quality: an unexpected opinion, an unconventional detail, an interest in ideas over small talk. People frequently find this rising sign easy to like and hard to know. There is warmth, but it often feels shared broadly rather than focused closely.",
      "Others usually read Aquarius rising as independent, intelligent and a little detached. Emotions may be discussed thoughtfully rather than displayed, and this can be mistaken for coolness. In groups, this ascendant often becomes the connector, introducing people and championing causes. With Aquarius on the 1st house, Leo falls on the 7th, suggesting partners who bring warmth, drama and personal attention that ask the Aquarius rising to step out of the crowd and be seen individually. The front door here is distinctive, perhaps painted an unexpected colour, and open to many, though few are shown every room.",
    ],
    approach: [
      "When facing a new situation, Aquarius rising tends to question the existing rules. Why is it done this way, and could it be done better? As a fixed air sign, Aquarius is linked with steady ideas and principled thinking, so once a conclusion is reached, it can be surprisingly hard to shift. Challenges are often approached from a detached, problem-solving angle. That objectivity can be extremely useful in a crisis. It can also leave others feeling their emotions were overlooked, so explaining the reasoning aloud helps keep everyone on side.",
      "Direction in life often involves community, innovation or a cause bigger than personal ambition. Aquarius rising people may follow paths that look unconventional from outside but feel entirely logical from within. Freedom to think independently tends to matter more than status. The risk is drifting into isolation, keeping a distance that protects independence but leaves deeper needs unmet. Balancing group involvement with a few close, one-to-one relationships can help this rising sign find a direction that is both individual and connected, where personal freedom and shared purpose support each other.",
    ],
    ruler:
      "Aquarius rising has Uranus as its modern chart ruler, with Saturn as the traditional ruler, and many astrologers consider both. The ascendant's ruler guides the chart, so the houses and aspects of these two planets show where independence and structure meet in this person's life. Uranus spends about seven years in each sign, making its house and aspects more personal than its sign. Saturn adds detail about discipline and long-term commitment. When Uranus touches personal planets, the Aquarius rising's originality tends to be especially visible to others.",
    style:
      "Traditionally, Aquarius rising is associated with a distinctive, individual presentation: an unusual accessory, an unexpected colour combination or a style that does not quite follow current fashion. Many astrologers describe a friendly, open expression and a slightly detached, observing air. Clothes may be chosen for ideas or comfort rather than trends. The overall energy tends to feel modern, curious and independent. As with every ascendant, this is a traditional sketch rather than a fixed description.",
    growth:
      "The growth edge for Aquarius rising often lies in intimacy. The ascendant's friendliness reaches many people, but closeness with a few can feel harder. When the Sun sits in a feeling sign such as Cancer or Pisces, the cool exterior may hide deep sensitivity that others rarely see. Practical ideas include expressing emotions directly instead of explaining them, staying present when conversations become personal, and allowing others to influence a strongly held view. Connection tends to deepen when independence feels secure rather than threatened, and when closeness is chosen freely.",
    faq: {
      question: "Why does Aquarius rising seem detached?",
      answer:
        "Aquarius rising tends to approach people and situations through ideas and observation, which can look detached. The friendliness is usually genuine but spread widely. Uranus and Saturn, its modern and traditional rulers, help show how this independent style plays out in a particular chart.",
    },
  },
  Pisces: {
    gist: "gentle receptivity, dreaminess and a soft, empathetic presence",
    impression: [
      "Pisces rising often makes a soft, almost elusive first impression. The eyes may seem dreamy, the manner gentle, and there is frequently a sense that this person is listening to something beyond the conversation. The ascendant reflects the sign coming over the eastern horizon at the exact birth moment, and Pisces there tends to make the outer style receptive and adaptable. Strangers often feel understood quickly, because this rising sign mirrors moods and responds with compassion. What they may not notice is how much the person absorbs from the atmosphere around them, carrying it home long after the meeting ends.",
      "Others usually read Pisces rising as kind, sensitive and imaginative, sometimes as vague or hard to pin down. The adaptability that makes this ascendant easy company can also blur boundaries, leaving people unsure where they stand. Creative or spiritual interests often show early. With Pisces on the 1st house, Virgo falls on the 7th, so partners often bring practicality, organisation and grounded care that helps the Pisces rising turn feelings and dreams into workable plans. The front door here is half open, with soft music drifting through into the street and a seat always kept free for anyone who looks lost.",
    ],
    approach: [
      "Pisces rising tends to approach new situations by feeling them out rather than analysing them. Intuition usually leads: a sense of whether a place or person feels right. As a mutable water sign, Pisces is associated with flow and adaptability, so this ascendant can adjust to many settings. Challenges may be met by going around rather than through, finding a gentle path where others push. The downside can be avoidance, waiting for a difficult situation to dissolve on its own. Learning to act on intuition, not only feel it, gives this placement real strength.",
      "Direction in life often emerges through inspiration, compassion or creativity. Pisces rising people may find meaning in art, care, service or anything that connects them with something larger than themselves. Rigid paths can feel stifling, yet complete freedom can leave them drifting. Many find it helpful to anchor dreams in small daily practices, such as a routine, a skill or a trusted collaborator. That gentle structure lets this rising sign's imagination become visible in the world rather than staying private, shared in forms that other people can actually receive and enjoy.",
    ],
    ruler:
      "Neptune is the modern chart ruler for Pisces rising, with Jupiter as its traditional ruler, and astrologers often read the two together. Because the ascendant's ruler steers the chart, the houses and aspects of these planets show where this person's imagination, faith and compassion tend to flow. Neptune stays in one sign for over a decade, so its house and contacts matter more personally than its sign. Jupiter adds detail about growth and generosity. When Neptune touches personal planets, the Pisces rising's sensitivity is often heightened.",
    style:
      "Traditionally, Pisces rising is associated with a soft, fluid presentation: gentle eyes, a dreamy expression and clothes that drape or flow rather than hold a rigid structure. Many astrologers describe a liking for sea colours, soft fabrics and outfits that shift with mood. Movement may be described as graceful or drifting. There is often an artistic touch somewhere in the look. As with every rising sign, this is a traditional image of style and energy, not a claim about anyone's appearance.",
    growth:
      "For Pisces rising, growth often involves boundaries. The ascendant's empathy is a gift, yet absorbing every mood can be exhausting and confusing. When the Sun sits in a decisive sign such as Aries or Capricorn, the soft front door may hide a strong will that others underestimate. Useful practices include pausing to ask whose feeling is being carried, saying no without long explanations, and grounding creative ideas in specific steps. A clear sense of self tends to make this rising sign's compassion more sustainable over the long run.",
    faq: {
      question: "What does Pisces rising look like?",
      answer:
        "Pisces rising is traditionally described as soft and dreamy, with gentle or expressive eyes, flowing clothes and a graceful, adaptable manner. People often find them approachable. Neptune and Jupiter, the modern and traditional rulers, add individual detail through their placements.",
    },
  },
};
