import OpenAI from "openai";

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return Response.json({ error: "No audio file provided" }, { status: 400 });
    }

    const client = getClient();
    const transcription = await client.audio.transcriptions.create({
      model: "whisper-1",
      file: new File([file], "audio.webm", { type: file.type }),
    });

    return Response.json({ text: transcription.text });
  } catch (error) {
    console.error("Transcription error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Transcription failed" },
      { status: 500 }
    );
  }
}
