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

/**
 * Fetches the latest posts from a Substack RSS feed. Returns an empty
 * array if no feed URL is configured or the fetch fails, so callers can
 * fall back to a placeholder state.
 */
export async function getLatestSubstackPosts(
  substackUrl: string,
  limit = 3
): Promise<SubstackPost[]> {
  if (!substackUrl) return [];

  try {
    const feedUrl = new URL("/feed", substackUrl).toString();
    const res = await fetch(feedUrl, {
      next: { revalidate: 3600 },
      headers: {
        // Substack's CDN blocks requests with no/bot-like User-Agent
        // (e.g. from CI runners), so spoof a normal browser request.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
    });
    if (!res.ok) {
      console.warn(`[substack] fetch failed: ${res.status} ${feedUrl}`);
      return [];
    }

    const xml = await res.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

    return items.slice(0, limit).map((item) => ({
      title: extractTag(item, "title"),
      link: extractTag(item, "link"),
      pubDate: extractTag(item, "pubDate"),
    }));
  } catch (err) {
    console.warn(`[substack] fetch threw:`, err);
    return [];
  }
}
