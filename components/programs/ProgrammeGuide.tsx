import type { Program, ProgrammeGuide as GuideData } from "@/lib/constants";

/**
 * Additive long-form guide block rendered BELOW the existing ProgramDetail
 * layout. Server component, so the content is in the SSR HTML for search and AI
 * crawlers. Renders only when a programme has a PROGRAMME_GUIDES entry.
 */
export function ProgrammeGuide({
  program,
  guide,
}: {
  program: Program;
  guide: GuideData;
}) {
  return (
    <div className="text-text-secondary">
      {/* Who it suits */}
      <section className="py-20 px-6" style={{ background: "#0d1018" }}>
        <div className="mx-auto max-w-4xl">
          <h2 className="heading-display text-2xl sm:text-3xl text-text-primary mb-8">
            Who {program.name} suits
          </h2>
          <ul className="space-y-4">
            {guide.whoItSuits.map((item, i) => (
              <li key={i} className="text-base leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Investment routes */}
      <section className="py-20 px-6" style={{ background: "#0a0e14" }}>
        <div className="mx-auto max-w-4xl">
          <h2 className="heading-display text-2xl sm:text-3xl text-text-primary mb-8">
            Investment routes
          </h2>
          <div className="space-y-4">
            {guide.investmentRoutes.map((route, i) => (
              <div
                key={i}
                className="rounded-xl bg-glass-bg border border-glass-border p-5"
              >
                <h3 className="text-text-primary font-medium mb-1">{route.name}</h3>
                <p className="text-sm leading-relaxed">{route.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Costs */}
      <section className="py-20 px-6" style={{ background: "#0d1018" }}>
        <div className="mx-auto max-w-4xl">
          <h2 className="heading-display text-2xl sm:text-3xl text-text-primary mb-8">
            Costs, in full
          </h2>
          <div className="rounded-xl bg-glass-bg border border-glass-border divide-y divide-[rgba(255,255,255,0.06)]">
            {guide.costs.map((row, i) => (
              <div key={i} className="flex items-center justify-between gap-6 p-4">
                <span className="text-base">{row.item}</span>
                <span className="text-text-primary font-medium text-right">
                  {row.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tax */}
      <section className="py-20 px-6" style={{ background: "#0a0e14" }}>
        <div className="mx-auto max-w-4xl">
          <h2 className="heading-display text-2xl sm:text-3xl text-text-primary mb-6">
            Tax considerations
          </h2>
          <p className="text-base leading-relaxed">{guide.taxNote}</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6" style={{ background: "#0d1018" }}>
        <div className="mx-auto max-w-4xl">
          <h2 className="heading-display text-2xl sm:text-3xl text-text-primary mb-8">
            {program.name}: frequently asked questions
          </h2>
          <div className="space-y-7">
            {guide.faqs.map((item, i) => (
              <div key={i}>
                <h3 className="text-text-primary font-medium mb-2">{item.q}</h3>
                <p className="text-base leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Author + sources (E-E-A-T) */}
      <section className="py-16 px-6" style={{ background: "#0a0e14" }}>
        <div className="mx-auto max-w-4xl text-sm text-text-muted">
          <p>
            Reviewed by{" "}
            <span className="text-text-secondary">{guide.author.name}</span>
            {guide.author.title ? `, ${guide.author.title}` : ""}. Last reviewed{" "}
            {guide.lastReviewed}.
          </p>
          {guide.sources.length > 0 && (
            <p className="mt-3">
              Sources:{" "}
              {guide.sources.map((s, i) => (
                <span key={i}>
                  {i > 0 ? ", " : ""}
                  <a
                    href={s.url}
                    className="underline hover:text-text-secondary"
                    rel="noopener noreferrer"
                  >
                    {s.label}
                  </a>
                </span>
              ))}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
