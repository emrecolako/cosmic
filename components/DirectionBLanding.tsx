import Link from 'next/link';
import ReadingArtwork from './ReadingArtwork';
import DateBox from './library/DateBox';
import { useI18n } from './LocaleProvider';
import { atlasCopy } from '@/lib/i18n/atlas';

const questions = [
  ['Can I see a reading before entering my details?', 'Yes. The fictional sample is public and free, and does not ask for birth information.'],
  ['What if I do not know my birth time?', 'You can still get a reading. The app omits Moon, rising, and house claims when the birth time is unknown.'],
  ['Is this a prediction?', 'No. The reading uses interpretive traditions as prompts for reflection; it is not a scientific assessment or a deterministic forecast.'],
  ['How is my reading written?', 'Your calculated profile and chosen life context inform an AI-generated interpretation. The three traditions are read together, rather than as separate reports.'],
  ['What happens to my details?', 'Calculations run in your browser. Your profile is sent to OpenRouter and its model providers for interpretation; generated readings may be cached for up to 24 hours.'],
];
export default function DirectionBLanding({ price, onStart }: { price: string | null; onStart: () => void }) {
  const { locale } = useI18n();
  const copy = atlasCopy[locale];
  const start = (placement: string, light = false) => <button className={`atlas-primary${light ? ' button-light' : ''}`} onClick={onStart} data-attr={placement}>{copy.discover} <span aria-hidden="true">↗</span></button>;
  return <div className="direction-b" lang="en">
    <section className="dossier-dark">
      <div className="atlas-shell dossier-hero">
        <div className="dossier-intro">
          <p className="eyebrow">Unified Reading / Astrology &amp; numerology, together</p>
          <h1 className="editorial">You are<br />not one thing.</h1>
          <p>Neither is your reading. Explore your numbers, zodiac signs, and current life chapter—together.</p>
          <DateBox pageType="home" slug="home" variant="hero" compare="lp" dayFirst={locale !== 'en'} price={price} />
          <div className="hero-actions"><Link className="atlas-link" href="/sample" data-attr="hero-sample">See a sample</Link></div>
          <p className="microcopy">Free result in seconds / No email / No account</p>
          <ReadingArtwork name="zodiac-armillary" className="hero-art" priority />
        </div>
        <article className="dossier-preview" aria-label="Fictional sample reading for Alex Morgan">
          <div className="dossier-meta"><span>U/R — Personal atlas</span><span>Fictional sample</span></div>
          <div className="dossier-identity"><div><h2>Alex Morgan.</h2><time dateTime="1990-11-04">04 Nov 1990</time></div><ReadingArtwork name="chinese-zodiac-horse" priority /></div>
          <div className="dossier-markers"><div><strong>7</strong><span>Life path</span></div><div><strong>Scorpio</strong><span>Sun sign</span></div><div><strong>Horse</strong><span>Metal / Yang</span></div></div>
          <div className="dossier-excerpt"><p className="eyebrow">The connection</p><h3>Depth meets restlessness.<br />Make room to explore both.</h3><p>An illustrative reading of the tension between inward reflection and outward movement.</p><Link className="text-action" href="/sample">Explore Alex’s full sample ↗</Link></div>
        </article>
      </div>
    </section>
    <section className="atlas-shell landing-section chapter-context">
      <div><p className="eyebrow">01 / The part only you can add</p><h2>Same person.<br />Different chapter.</h2><p>Your profile is a starting point. The chapter you’re living gives your reading context.</p></div>
      <ol className="context-questions">{[['What’s changing?', 'A beginning. A transition. A new direction.'], ['What keeps returning?', 'The patterns you want to understand.'], ['What matters now?', 'The life chapters you choose to explore.']].map(([title, text], i) => <li key={title}><span className="eyebrow">{['I', 'II', 'III'][i]}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>
    </section>
    <section id="method" className="section-rule"><div className="atlas-shell landing-section">
      <div className="section-heading"><h2>Three lenses. A fuller picture.</h2><span className="eyebrow">02 / The method</span></div>
      <div className="method-composition"><ReadingArtwork name="chapters-book" /><div className="method-rows">
        <article><p className="eyebrow">01 / Numerology</p><h3>The numbers in your name.</h3><p>Your birth name and date reveal five core numbers, from Life Path to Personal Year.</p></article>
        <article><p className="eyebrow">02 / Western astrology</p><h3>Your place in the sky.</h3><p>Start with your Sun sign. A known birth time and place can add Moon and rising signs and your houses.</p></article>
        <article><p className="eyebrow">03 / Chinese zodiac</p><h3>Another way to see yourself.</h3><p>Your animal, element, and yin or yang offer another perspective on the same person.</p></article>
        <p className="microcopy">Houses with a birth time and place. No aspects or current transits.<br /><Link href="/about">Read about the method ↗</Link></p>
      </div></div>
    </div></section>
    <section className="reflection-band"><div className="atlas-shell"><p className="eyebrow">From Alex’s fictional sample / A small thing to try</p><blockquote>“Keep a question journal<br />for seven days.”</blockquote><p>A useful reflection can begin with a very ordinary action.</p><Link href="/sample" className="text-action">Explore the sample ↗</Link></div></section>
    <section id="how-it-works" className="atlas-shell landing-section"><div className="section-heading"><h2>Your life adds the context.</h2><span className="eyebrow">03 / How it works</span></div><ol className="reading-steps">{[['Start with your details.', 'Your birth name and date. Add a time and place if you know them.'], ['Tell us where you are.', 'Choose the life chapters that feel relevant to you right now.'], ['Read. Reflect. Go deeper.', price ? `Explore your preview, then choose the full reading for ${price}.` : 'Explore your calculated profile and interpretation preview.']].map(([title, text], i) => <li key={title}><span className="eyebrow">0{i + 1} —</span><h3>{title}</h3><p>{text}</p></li>)}</ol></section>
    <section className="dossier-dark"><div className="atlas-shell landing-section offer-composition"><div><p className="eyebrow">The full reading</p><h2>Go a little<br />deeper.</h2><p>Connect the themes across your profile with a longer interpretation and practical takeaways.</p><p className="microcopy">No account. No subscription.</p></div><div className="offer-action"><div className="offer-price">{price || 'Start free'}{price && <span className="eyebrow">One time</span>}</div><span lang={locale}>{start('pricing-start-preview', true)}</span><p>Download before closing this tab. Paid online access lasts 24 hours from checkout and ends if this tab’s session storage is cleared.</p><Link href="/pricing" className="text-action">{price ? 'Final total shown before payment ↗' : 'View pricing and checkout availability ↗'}</Link></div></div></section>
    <section className="atlas-shell landing-section faq-composition"><div><p className="eyebrow">Before you begin</p><h2>A few earthly<br />questions.</h2></div><div className="faq-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}<Link href="/privacy" className="text-action">Your details, explained ↗</Link></div></section>
    <section className="closing-section section-rule"><p className="eyebrow">You’re still the author</p><h2>See your story from here.</h2><span lang={locale}>{start('closing-start-preview')}</span><ReadingArtwork name="chapters-book" /><p className="closing-wordmark">Unified Reading.</p></section>
  </div>;
}
