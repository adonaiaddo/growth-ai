import { createOpenAI } from "@ai-sdk/openai";

// Swap model by changing this single line
const MODEL_ID = "gpt-5-mini";

const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "missing-key",
  fetch: async (url, init) => {
    const maxRetries = 3;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const res = await fetch(url, init);
      if (res.status === 429 && attempt < maxRetries) {
        const retryAfter = res.headers.get("retry-after");
        const waitMs = retryAfter
          ? parseFloat(retryAfter) * 1000
          : Math.min(2000 * Math.pow(2, attempt), 15000);
        console.log(
          `[AI] Rate limited (429). Retrying in ${Math.round(waitMs)}ms (attempt ${attempt + 1}/${maxRetries})`
        );
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      return res;
    }
    return fetch(url, init);
  },
});

export const model = openaiProvider(MODEL_ID);
