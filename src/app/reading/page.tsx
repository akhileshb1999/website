import { getReadingList } from "@/lib/content";

export default function ReadingPage() {
  const items = getReadingList();

  return (
    <div>
      <h1 className="font-serif text-3xl">What Am I Reading</h1>
      <p className="mt-3 max-w-xl text-muted">
        Books, articles, and reports I&apos;m working through, with a short
        takeaway from each.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-serif text-lg">{item.title}</h2>
              <span className="font-mono text-xs text-muted">{item.date}</span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {item.author} · {item.status}
            </p>
            <p className="mt-3 text-sm leading-relaxed">{item.takeaway}</p>
            {item.tags?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-2 py-0.5 font-mono text-xs text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
