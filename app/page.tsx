import { headers } from "next/headers";
import LandingForm from "@/components/landing/LandingForm";
import { getMessages, negotiateLocale } from "@/lib/i18n";
import { SOCIAL_PROOF } from "@/lib/social-proof";

export default async function HomePage() {
  const locale = negotiateLocale((await headers()).get("accept-language"));
  const t = getMessages(locale);
  const l = t.landing;

  const steps = [
    { title: l.how1Title, body: l.how1Body },
    { title: l.how2Title, body: l.how2Body },
    { title: l.how3Title, body: l.how3Body },
  ];

  return (
    <main className="min-h-dvh pt-12">
      <div className="mx-auto max-w-xl lg:max-w-6xl px-4 sm:px-6 pt-8 pb-16 lg:pt-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16 lg:items-start">
          {/* Above the fold: what this is, what you get, what to do. */}
          <section aria-labelledby="hero-title" className="lg:sticky lg:top-24">
            <p className="font-mono text-xs tracking-wider uppercase text-ink-muted mb-4">
              {l.badge}
            </p>
            <h1
              id="hero-title"
              className="text-[1.875rem] leading-[1.15] sm:text-5xl sm:leading-[1.1] font-light tracking-tight text-ink text-balance"
            >
              {l.headline}
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-relaxed text-ink-secondary max-w-xl">
              {l.lede}
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs tracking-wider uppercase text-ink-secondary">
              {[l.chipFree, l.chipNoSignup, l.chipTime].map((chip) => (
                <li key={chip} className="flex items-center gap-2">
                  <span aria-hidden="true" className="text-ink">✓</span>
                  {chip}
                </li>
              ))}
            </ul>

            <div className="hidden lg:block mt-12">
              <SampleResult t={t} />
            </div>
          </section>

          <div id="start">
            <LandingForm />
          </div>
        </div>

        {/* Below the fold: for visitors who need convincing before starting. */}
        <div className="mt-20 grid gap-16 lg:mt-28">
          <section aria-labelledby="how-title">
            <h2
              id="how-title"
              className="font-mono text-xs tracking-wider uppercase text-ink-muted mb-6"
            >
              {l.howTitle}
            </h2>
            <ol className="grid gap-4 lg:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title} className="rounded-lg bg-panel p-5">
                  <span className="number-mono text-xs text-ink-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 text-base text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <div className="lg:hidden">
            <SampleResult t={t} />
          </div>

          {SOCIAL_PROOF && (
            <section aria-label="What people say" className="grid gap-4">
              {SOCIAL_PROOF.stat && (
                <p className="font-mono text-sm tracking-wider uppercase text-ink">
                  {SOCIAL_PROOF.stat}
                </p>
              )}
              {SOCIAL_PROOF.testimonials?.map((item) => (
                <figure key={item.author} className="card p-5">
                  <blockquote className="text-ink-secondary">“{item.quote}”</blockquote>
                  <figcaption className="mt-2 text-sm text-ink-muted">— {item.author}</figcaption>
                </figure>
              ))}
            </section>
          )}

          <section
            aria-labelledby="privacy-title"
            className="border-t border-line-muted pt-8 grid gap-2 sm:grid-cols-[12rem_1fr] sm:gap-8"
          >
            <h2
              id="privacy-title"
              className="font-mono text-xs tracking-wider uppercase text-ink"
            >
              {l.privacyTitle}
            </h2>
            <p className="text-sm leading-relaxed text-ink-muted max-w-2xl">
              {l.privacyBody}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

function SampleResult({ t }: { t: ReturnType<typeof getMessages> }) {
  const l = t.landing;
  return (
    <figure aria-labelledby="sample-label" className="card p-5 sm:p-6">
      <p
        id="sample-label"
        className="font-mono text-xs tracking-wider uppercase text-ink-muted"
      >
        {l.sampleLabel}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[l.sampleLifePath, l.sampleSun, l.sampleAnimal].map((item) => (
          <div
            key={item}
            className="rounded-md bg-panel px-3 py-3 text-sm text-ink leading-snug"
          >
            {item}
          </div>
        ))}
      </div>
      <blockquote className="mt-4 text-[15px] leading-relaxed text-ink-secondary">
        {l.sampleExcerpt}
      </blockquote>
      <figcaption className="mt-3 text-xs text-ink-muted">{l.sampleNote}</figcaption>
    </figure>
  );
}
