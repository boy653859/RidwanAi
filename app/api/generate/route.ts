import Cartesia from "@cartesia/cartesia-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VOICES: Record<string, string> = {
  Narrator: "89da9de1-fa23-4598-a1d2-481817edd69a",
  "Voice 2": "YOUR-VOICE-ID",
  "Voice 3": "YOUR-VOICE-ID",
};

const ALLOWED_MODELS = new Set(["sonic-3.6", "sonic-3.5", "sonic-3"]);
const ALLOWED_RATES = new Set([8000, 16000, 24000, 44100, 48000]);

type Body = {
  apiKey?: string;
  modelId?: string;
  transcript?: string;
  voiceName?: string;
  voiceId?: string;
  sampleRate?: number;
  speed?: number;
  volume?: number;
};

function safeFilename(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "") || "Voice";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;

    // Server-side key takes precedence if configured.
    const apiKey = process.env.CARTESIA_API_KEY || body.apiKey?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "No Cartesia API key provided." },
        { status: 400 }
      );
    }

    const modelId = body.modelId || "sonic-3.6";
    const transcript = body.transcript?.trim() || "";
    const voiceName = body.voiceName || "Narrator";
    const voiceId = body.voiceId || VOICES[voiceName];
    const sampleRate = body.sampleRate || 44100;
    const speed = body.speed ?? 1;
    const volume = body.volume ?? 1;

    if (!ALLOWED_MODELS.has(modelId)) {
      return NextResponse.json({ error: "Invalid model." }, { status: 400 });
    }

    if (!transcript || transcript.length > 20000) {
      return NextResponse.json(
        { error: "Transcript must contain 1–20,000 characters." },
        { status: 400 }
      );
    }

    if (!VOICES[voiceName]) {
      return NextResponse.json({ error: "Invalid voice." }, { status: 400 });
    }

    if (!voiceId || voiceId.startsWith("YOUR-")) {
      return NextResponse.json(
        { error: `Configure the Voice ID for "${voiceName}" in route.ts.` },
        { status: 400 }
      );
    }

    if (!ALLOWED_RATES.has(sampleRate)) {
      return NextResponse.json({ error: "Invalid sample rate." }, { status: 400 });
    }

    if (speed < 0.1 || speed > 2 || volume < 0.5 || volume > 2) {
      return NextResponse.json({ error: "Invalid speed or volume." }, { status: 400 });
    }

    const client = new Cartesia({ apiKey });

    const response = await client.tts.generate({
      model_id: modelId,
      transcript,
      voice: {
        mode: "id",
        id: voiceId,
      },
      output_format: {
        container: "wav",
        encoding: "pcm_s16le",
        sample_rate: sampleRate as 8000 | 16000 | 24000 | 44100 | 48000,
      },
      generation_config: {
        speed,
        volume,
      },
    });

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const timestamp = new Date().toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "")
      .replace("T", "_");

    const filename = `RidwanAI_${safeFilename(voiceName)}_${timestamp}.wav`;

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(audioBuffer.length),
        "X-Filename": filename,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed." },
      { status: 500 }
    );
  }
}
