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
