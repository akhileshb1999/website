import { getWhatsNew } from "@/lib/content";

export default function WhatsNewPage() {
  const items = getWhatsNew();

  return (
    <div>
      <h1 className="font-serif text-3xl">What&apos;s New</h1>
      <p className="mt-3 max-w-xl text-muted">
        Things outside of markets I&apos;m currently excited about.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-serif text-lg">
                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    {item.title}
                  </a>
                ) : (
                  item.title
                )}
              </h2>
              <span className="font-mono text-xs text-muted">{item.date}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
