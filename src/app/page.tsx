import Link from "next/link";
import { getProfile } from "@/lib/content";
import { getSubstackActivity } from "@/lib/substack";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function HomePage() {
  const profile = getProfile();
  const activity = await getSubstackActivity(profile.links.substack, 20);

  return (
    <div className="flex flex-col gap-16">
      <section>
        <p className="font-mono text-sm text-muted">{profile.title}</p>
        <h1 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">
          {profile.name}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">{profile.tagline}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/coverage"
            className="rounded-full bg-foreground px-4 py-2 text-sm text-background transition hover:opacity-90"
          >
            See what I&apos;m covering
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-border px-4 py-2 text-sm transition hover:border-foreground/30"
          >
            About me
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted">
          {profile.email && (
            <a className="hover:text-foreground" href={`mailto:${profile.email}`}>
              Email
            </a>
          )}
          {profile.links.linkedin && (
            <a
              className="hover:text-foreground"
              href={profile.links.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          )}
          {profile.links.twitter && (
            <a
              className="hover:text-foreground"
              href={profile.links.twitter}
              target="_blank"
              rel="noreferrer"
            >
              Twitter / X
            </a>
          )}
          {profile.links.substack && (
            <a
              className="hover:text-foreground"
              href={profile.links.substack}
              target="_blank"
              rel="noreferrer"
            >
              Substack
            </a>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-xl">Latest Activity</h2>
        {activity.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-3">
            {activity.map((item) => (
              <li key={item.link}>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-border bg-card p-4 transition hover:border-foreground/30"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted">
                      {item.type}
                    </span>
                    {item.date && (
                      <p className="text-xs text-muted">
                        {formatDate(item.date)}
                      </p>
                    )}
                  </div>
                  {item.type === "post" ? (
                    <>
                      <p className="mt-2 font-serif">{item.title}</p>
                      {item.excerpt && (
                        <p className="mt-1 text-sm text-muted">
                          {item.excerpt}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-2 text-sm">{item.excerpt}</p>
                  )}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">
            Add a Substack URL to <code className="font-mono">profile.json</code>{" "}
            to pull in recent posts and notes here.
          </p>
        )}
      </section>
    </div>
  );
}
