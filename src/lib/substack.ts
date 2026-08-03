export interface SubstackPost {
  title: string;
  link: string;
  pubDate: string;
}

function extractTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  if (!match) return "";
  return match[1]
    .replace("<![CDATA[", "")
    .replace("]]>", "")
    .trim();
}

function parseRssXml(xml: string, limit: number): SubstackPost[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  return items.slice(0, limit).map((item) => ({
    title: extractTag(item, "title"),
    link: extractTag(item, "link"),
    pubDate: extractTag(item, "pubDate"),
  }));
}

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/rss+xml, application/xml, text/xml, */*",
};

/**
 * Fetches the feed directly. Substack's CDN blocks requests from known
 * datacenter/CI IP ranges (e.g. GitHub Actions runners) regardless of
 * headers, so this often fails when run in CI — see fetchViaProxy.
 */
async function fetchDirect(
  feedUrl: string,
  limit: number
): Promise<SubstackPost[] | null> {
  const res = await fetch(feedUrl, {
    next: { revalidate: 3600 },
    headers: BROWSER_HEADERS,
  });
  if (!res.ok) {
    console.warn(`[substack] direct fetch failed: ${res.status} ${feedUrl}`);
    return null;
  }
  return parseRssXml(await res.text(), limit);
}

/**
 * Fetches the feed via a public RSS-to-JSON proxy. The proxy's own
 * servers fetch Substack (not ours), which sidesteps IP-based blocking
 * from CI environments.
 */
async function fetchViaProxy(
  feedUrl: string,
  limit: number
): Promise<SubstackPost[] | null> {
  const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
  const res = await fetch(proxyUrl, { next: { revalidate: 3600 } });
  if (!res.ok) {
    console.warn(`[substack] proxy fetch failed: ${res.status}`);
    return null;
  }

  const data = (await res.json()) as {
    status: string;
    items?: { title: string; link: string; pubDate: string }[];
  };
  if (data.status !== "ok" || !data.items) {
    console.warn(`[substack] proxy returned non-ok status`);
    return null;
  }

  return data.items.slice(0, limit).map((item) => ({
    title: item.title,
    link: item.link,
    pubDate: item.pubDate,
  }));
}

/**
 * Fetches the latest posts from a Substack RSS feed. Returns an empty
 * array if no feed URL is configured or every fetch strategy fails, so
 * callers can fall back to a placeholder state.
 */
export async function getLatestSubstackPosts(
  substackUrl: string,
  limit = 3
): Promise<SubstackPost[]> {
  if (!substackUrl) return [];

  const feedUrl = new URL("/feed", substackUrl).toString();

  try {
    const viaProxy = await fetchViaProxy(feedUrl, limit);
    if (viaProxy) return viaProxy;
  } catch (err) {
    console.warn(`[substack] proxy fetch threw:`, err);
  }

  try {
    const direct = await fetchDirect(feedUrl, limit);
    if (direct) return direct;
  } catch (err) {
    console.warn(`[substack] direct fetch threw:`, err);
  }

  return [];
}

export interface SubstackActivityItem {
  type: "post" | "note";
  title: string;
  excerpt: string;
  link: string;
  date: string;
}

interface RawFeedItem {
  type: string;
  post?: {
    title: string;
    subtitle?: string;
    canonical_url: string;
    post_date: string;
  };
  comment?: {
    id: number;
    body: string;
    handle: string;
    date: string;
  };
}

function truncate(text: string, max: number): string {
  const clean = text.trim().replace(/\s+/g, " ");
  return clean.length > max ? `${clean.slice(0, max).trim()}…` : clean;
}

/**
 * Fetches JSON from a Substack API endpoint. Tries a direct fetch
 * first; if that fails (e.g. blocked by IP, as happens from CI
 * runners), retries through Jina's reader proxy, whose servers do the
 * actual request instead of ours.
 */
async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: BROWSER_HEADERS,
    });
    if (res.ok) return (await res.json()) as T;
    console.warn(`[substack] direct fetch failed: ${res.status} ${url}`);
  } catch (err) {
    console.warn(`[substack] direct fetch threw for ${url}:`, err);
  }

  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      next: { revalidate: 3600 },
      headers: { "X-Return-Format": "text" },
    });
    if (!res.ok) {
      console.warn(`[substack] jina proxy fetch failed: ${res.status} ${url}`);
      return null;
    }
    return JSON.parse(await res.text()) as T;
  } catch (err) {
    console.warn(`[substack] jina proxy fetch threw for ${url}:`, err);
    return null;
  }
}

async function fetchProfileId(handle: string): Promise<number | null> {
  const data = await fetchJson<{ id?: number }>(
    `https://substack.com/api/v1/user/${handle}/public_profile`
  );
  return data?.id ?? null;
}

/**
 * Fetches Substack's own reader activity feed, which mixes posts and
 * Notes together (Notes have no RSS feed, so this is the only way to
 * pull them in). This is a private-looking but publicly-accessible
 * endpoint, so it may change without notice — callers should fall back
 * to the RSS-based posts-only feed if this fails.
 */
async function fetchActivityFeed(
  handle: string,
  limit: number
): Promise<SubstackActivityItem[] | null> {
  const id = await fetchProfileId(handle);
  if (!id) return null;

  const data = await fetchJson<{ items?: RawFeedItem[] }>(
    `https://substack.com/api/v1/reader/feed/profile/${id}`
  );
  if (!data?.items) return null;

  const activity: SubstackActivityItem[] = data.items.flatMap(
    (item): SubstackActivityItem[] => {
      if (item.type === "post" && item.post) {
        return [
          {
            type: "post",
            title: item.post.title,
            excerpt: item.post.subtitle ?? "",
            link: item.post.canonical_url,
            date: item.post.post_date,
          },
        ];
      }
      if (item.type === "comment" && item.comment) {
        return [
          {
            type: "note",
            title: "Note",
            excerpt: truncate(item.comment.body, 160),
            link: `https://substack.com/@${item.comment.handle}/note/c-${item.comment.id}`,
            date: item.comment.date,
          },
        ];
      }
      return [];
    }
  );

  return activity
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

/**
 * Fetches recent Substack activity (posts and Notes combined). Falls
 * back to a posts-only list via the RSS proxy if the activity feed is
 * unreachable, and to an empty array if that fails too.
 */
export async function getSubstackActivity(
  substackUrl: string,
  limit = 5
): Promise<SubstackActivityItem[]> {
  if (!substackUrl) return [];

  const handle = new URL(substackUrl).hostname.split(".")[0];

  try {
    const activity = await fetchActivityFeed(handle, limit);
    if (activity) return activity;
  } catch (err) {
    console.warn(`[substack] activity fetch threw:`, err);
  }

  const posts = await getLatestSubstackPosts(substackUrl, limit);
  return posts.map((post) => ({
    type: "post" as const,
    title: post.title,
    excerpt: "",
    link: post.link,
    date: post.pubDate,
  }));
}
