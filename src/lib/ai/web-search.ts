import { tavily, TavilyClient } from "@tavily/core";

// Lazy-init to avoid build-time errors
let _client: TavilyClient | null = null;
function getClient(): TavilyClient {
  if (!_client) {
    _client = tavily({ apiKey: process.env.TAVILY_API_KEY });
  }
  return _client;
}

export async function searchWeb(
  query: string,
  options?: { maxResults?: number }
): Promise<{ title: string; url: string; content: string }[]> {
  const client = getClient();
  const response = await client.search(query, {
    maxResults: options?.maxResults ?? 5,
    searchDepth: "basic",
  });

  return response.results.map((r) => ({
    title: r.title ?? "",
    url: r.url,
    content: r.content ?? "",
  }));
}

export async function scrapeUrl(
  url: string
): Promise<{ url: string; title: string; content: string }> {
  const client = getClient();
  const response = await client.extract([url], {
    format: "markdown",
  });

  if (response.results.length === 0) {
    const failed = response.failedResults?.[0];
    throw new Error(
      `Failed to extract content from ${url}: ${failed?.error ?? "Unknown error"}`
    );
  }

  const result = response.results[0];
  return {
    url: result.url,
    title: result.title ?? "",
    content: result.rawContent,
  };
}
