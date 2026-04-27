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
  size: "1024x1024" | "1792x1024" = "1024x1024"
): Promise<{ url: string; localPath: string; revisedPrompt: string }> {
  const client = getClient();
  const response = await client.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size,
    quality: "standard",
  });

  const data = response.data;
  if (!data || data.length === 0) {
    throw new Error("No image data returned from DALL-E");
  }

  const image = data[0];
  const url = image.url!;

  // Immediately download and cache the image before the URL expires
  mkdirSync(IMAGE_CACHE_DIR, { recursive: true });
  const localPath = join(IMAGE_CACHE_DIR, `${randomUUID()}.png`);

  try {
    const res = await fetch(url);
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      writeFileSync(localPath, buffer);
      console.log(`[Creative] Image cached: ${localPath} (${buffer.length} bytes)`);
    } else {
      console.log(`[Creative] Warning: Could not cache image (HTTP ${res.status})`);
    }
  } catch (e) {
    console.log(`[Creative] Warning: Could not cache image: ${e}`);
  }

  return {
    url,
    localPath,
    revisedPrompt: image.revised_prompt ?? prompt,
  };
}
