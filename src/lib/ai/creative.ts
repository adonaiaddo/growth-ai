import OpenAI from "openai";
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import { tmpdir } from "os";

// Lazy-init to avoid build-time errors
let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

/** Directory to cache generated images so they survive URL expiry */
const IMAGE_CACHE_DIR = join(tmpdir(), "growth-ai-images");

/**
 * Get a cached image as a Buffer, or null if not found.
 */
export function getCachedImage(localPath: string): Buffer | null {
  try {
    if (existsSync(localPath)) {
      return readFileSync(localPath);
    }
  } catch {
    // ignore
  }
  return null;
}

export async function generateImage(
  prompt: string,
  size: "1024x1024" | "1536x1024" = "1024x1024"
): Promise<{ url: string; localPath: string; revisedPrompt: string }> {
  const client = getClient();
  const response = await client.images.generate({
    model: "gpt-image-1",
    prompt,
    n: 1,
    size,
    quality: "high",
  });

  const data = response.data;
  if (!data || data.length === 0) {
    throw new Error("No image data returned from GPT Image");
  }

  const image = data[0];

  // gpt-image-1 returns base64 data — save directly to local cache
  mkdirSync(IMAGE_CACHE_DIR, { recursive: true });
  const filename = `${randomUUID()}.png`;
  const localPath = join(IMAGE_CACHE_DIR, filename);

  const b64 = image.b64_json;
  if (!b64) {
    throw new Error("No base64 image data in response");
  }

  const buffer = Buffer.from(b64, "base64");
  writeFileSync(localPath, buffer);
  console.log(`[Creative] Image saved: ${localPath} (${buffer.length} bytes)`);

  // Serve the cached image via local API route
  const url = `/api/image/${filename}`;

  return {
    url,
    localPath,
    revisedPrompt: prompt,
  };
}
