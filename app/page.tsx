 "use client";

import { useMemo, useState } from "react";

const VOICES = {
  Narrator: "89da9de1-fa23-4598-a1d2-481817edd69a",
  "Voice 2": "YOUR-VOICE-ID",
  "Voice 3": "YOUR-VOICE-ID",
} as const;

const models = [
  { value: "sonic-3.6", label: "Sonic 3.6" },
  { value: "sonic-3.5", label: "Sonic 3.5" },
  { value: "sonic-3", label: "Sonic 3" },
];

const sampleRates = [8000, 16000, 24000, 44100, 48000];

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("sonic-3.6");
  const [voice, setVoice] = useState<keyof typeof VOICES>("Narrator");
  const [transcript, setTranscript] = useState("");
  const [sampleRate, setSampleRate] = useState(44100);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [filename, setFilename] = useState("");

  const charCount = transcript.length;

  const voiceConfigured = useMemo(
    () => !VOICES[voice].startsWith("YOUR-"),
    [voice]
  );

  async function generate() {
    setError(false);
    setMessage("");
    setAudioUrl("");
    setFilename("");

    if (!apiKey.trim()) {
      setError(true);
      setMessage("Please enter your Cartesia API key.");
      return;
    }

    if (!transcript.trim()) {
      setError(true);
      setMessage("Please enter a transcript.");
      return;
    }

    if (!voiceConfigured) {
      setError(true);
      setMessage(`Set the Voice ID for "${voice}" in app/api/generate/route.ts first.`);
      return;
    }

    setLoading(true);
    setMessage("Generating voice...");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          modelId: model,
          transcript,
          voiceName: voice,
          voiceId: VOICES[voice],
          sampleRate,
          speed,
          volume,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Voice generation failed.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const serverFilename =
        response.headers.get("X-Filename") || "RidwanAI_Voice.wav";

      setAudioUrl(url);
      setFilename(serverFilename);
      setMessage("Voice generated successfully.");
      setError(false);
    } catch (e) {
      setError(true);
      setMessage(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <header className="topbar">
        <div className="brand">
          <div className="logo">✦</div>
          <div>
            <h1>RidwanAI</h1>
            <p>Cartesia Sonic Voice Generator</p>
          </div>
        </div>
        <div className="ready"><span /> Ready</div>
      </header>

      <section className="card">
        <div className="field">
          <label>API KEY</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Cartesia API key"
            autoComplete="off"
          />
          <small className="hint">
            The key is used for this generation request and is not stored by this app.
          </small>
        </div>

        <div className="grid">
          <div className="field">
            <label>MODEL</label>
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              {models.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>VOICE</label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value as keyof typeof VOICES)}
            >
              {Object.keys(VOICES).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label>TRANSCRIPT</label>
          <textarea
            value={transcript}
            maxLength={20000}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Write the text you want to convert to speech..."
          />
          <div className="counter">{charCount.toLocaleString()} / 20,000</div>
        </div>

        <h2>OUTPUT</h2>
        <div className="grid">
          <div className="field">
            <label>CONTAINER</label>
            <select disabled value="wav" onChange={() => {}}>
              <option value="wav">WAV</option>
            </select>
          </div>

          <div className="field">
            <label>SAMPLE RATE</label>
            <select
              value={sampleRate}
              onChange={(e) => setSampleRate(Number(e.target.value))}
            >
              {sampleRates.map((rate) => (
                <option key={rate} value={rate}>
                  {rate.toLocaleString()} Hz
                </option>
              ))}
            </select>
          </div>
        </div>

        <h2>VOICE SETTINGS</h2>
        <div className="grid">
          <RangeField
            label="SPEED"
            value={speed}
            min={0.1}
            max={2}
            step={0.1}
            onChange={setSpeed}
          />
          <RangeField
            label="VOLUME"
            value={volume}
            min={0.5}
            max={2}
            step={0.1}
            onChange={setVolume}
          />
        </div>

        <button className="generate" onClick={generate} disabled={loading}>
          {loading ? "⏳ Generating..." : "✨ Generate Voice"}
        </button>

        {message && (
          <div className={`message ${error ? "error" : "success"}`}>{message}</div>
        )}

        {audioUrl && (
          <section className="result">
            <h2>GENERATED AUDIO</h2>
            <div className="audioBox">
              <div className="fileLine">
                <span>{filename}</span>
                <a href={audioUrl} download={filename}>Download</a>
              </div>
              <audio controls src={audioUrl} />
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function RangeField({
  label, value, min, max, step, onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="rangeRow">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className="rangeValue">{value.toFixed(1)}</span>
      </div>
    </div>
  );
}
