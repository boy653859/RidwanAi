"use client";

import { useState } from "react";

const VOICES = {
  Female: "59ba7dee-8f9a-432f-a6c0-ffb33666b654",
  Male: "2ba861ea-7cdc-43d1-8608-4045b5a41de5",
  Azhari: "89da9de1-fa23-4598-a1d2-481817edd69a",
} as const;

const models = [
  ["sonic-3.6", "Sonic 3.6"],
  ["sonic-3.5", "Sonic 3.5"],
  ["sonic-3", "Sonic 3"],
] as const;

const rates = [8000, 16000, 24000, 44100, 48000];

const rateLabels: Record<number, string> = {
  8000: "8 kHz",
  16000: "16 kHz",
  24000: "24 kHz",
  44100: "44.1 kHz",
  48000: "48 kHz",
};

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [show, setShow] = useState(false);
  const [model, setModel] = useState("sonic-3.6");
  const [voice, setVoice] =
    useState<keyof typeof VOICES>("Female");
  const [text, setText] = useState("");
  const [rate, setRate] = useState(44100);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState(false);
  const [url, setUrl] = useState("");
  const [file, setFile] = useState("");

  async function generate() {
    setMsg("");
    setErr(false);
    setFile("");

    if (url) {
      URL.revokeObjectURL(url);
      setUrl("");
    }

    if (!apiKey.trim()) {
      setErr(true);
      setMsg("Please enter your API key.");
      return;
    }

    if (!text.trim()) {
      setErr(true);
      setMsg("Please enter some text first.");
      return;
    }

    setLoading(true);
    setMsg("Creating your voice...");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          modelId: model,
          transcript: text.trim(),
          voiceName: voice,
          voiceId: VOICES[voice],
          sampleRate: rate,
          speed,
          volume,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.error ||
            `Generation failed (${response.status}).`
        );
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);

      const filename =
        response.headers.get("X-Filename") ||
        `RidwanAI_${voice}_Voice.wav`;

      setUrl(audioUrl);
      setFile(filename);
      setMsg("Your voice is ready.");
    } catch (error) {
      setErr(true);

      setMsg(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <header>
        <div className="brand">
          <div className="logo">R</div>

          <div>
            <b>RidwanAI</b>
            <small>Text to Voice Generator</small>
          </div>
        </div>

        <div className="ready">
          <i />
          Ready
        </div>
      </header>

      <section className="hero">
        <p>VOICE STUDIO</p>

        <h1>
          Turn your text into natural voice.
        </h1>

        <span>
          Create speech with simple controls and
          download your audio instantly.
        </span>
      </section>

      <section className="card">
        <div className="head">
          <div>
            <h2>Voice settings</h2>
            <small>
              Configure your voice and output.
            </small>
          </div>

          <em>● Private request</em>
        </div>

        <label>API KEY</label>

        <div className="key">
          <input
            type={show ? "text" : "password"}
            value={apiKey}
            onChange={(e) =>
              setApiKey(e.target.value)
            }
            placeholder="Paste your API key"
          />

          <button
            type="button"
            onClick={() => setShow(!show)}
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>

        <small className="hint">
          Used only for the current generation request.
        </small>

        <div className="grid">
          <Field label="MODEL">
            <select
              value={model}
              onChange={(e) =>
                setModel(e.target.value)
              }
            >
              {models.map(([value, label]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="VOICE">
            <select
              value={voice}
              onChange={(e) =>
                setVoice(
                  e.target.value as keyof typeof VOICES
                )
              }
            >
              {Object.keys(VOICES).map((name) => (
                <option
                  key={name}
                  value={name}
                >
                  {name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="labelrow">
          <label>TRANSCRIPT</label>

          <small>
            {text.length.toLocaleString()} / 20,000
          </small>
        </div>

        <textarea
          maxLength={20000}
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
          placeholder="Write something you want to hear..."
        />

        <hr />

        <h3>Output</h3>

        <div className="grid">
          <Field label="FORMAT">
            <select disabled value="wav">
              <option value="wav">WAV</option>
            </select>
          </Field>

          <Field label="SAMPLE RATE">
            <select
              value={rate}
              onChange={(e) =>
                setRate(Number(e.target.value))
              }
            >
              {rates.map((value) => (
                <option
                  key={value}
                  value={value}
                >
                  {rateLabels[value]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid">
          <Range
            label="SPEED"
            value={speed}
            min={0.1}
            max={2}
            onChange={setSpeed}
          />

          <Range
            label="VOLUME"
            value={volume}
            min={0.5}
            max={2}
            onChange={setVolume}
          />
        </div>

        <button
          className="generate"
          disabled={loading}
          onClick={generate}
          type="button"
        >
          {loading
            ? "◌ Creating voice..."
            : "✦ Generate Voice"}
        </button>

        {msg && (
          <div className={err ? "error" : "success"}>
            {msg}
          </div>
        )}

        {url && (
          <section className="result">
            <div className="resulthead">
              <div>
                <p>READY TO USE</p>
                <h2>Your audio</h2>
              </div>

              <a
                className="download"
                href={url}
                download={file}
              >
                ↓ &nbsp; Download WAV
              </a>
            </div>

            <div className="player">
              <div className="wav">WAV</div>

              <div className="info">
                <b>{file}</b>
                <small>WAV audio file</small>
              </div>

              <audio
                controls
                src={url}
              />
            </div>

            <a
              className="mobileDownload"
              href={url}
              download={file}
            >
              ↓ &nbsp; Download audio
            </a>
          </section>
        )}
      </section>

      <footer>
        RidwanAI · Text to Voice Generator
      </footer>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function Range({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="field">
      <div className="labelrow">
        <label>{label}</label>

        <small>{value.toFixed(1)}</small>
      </div>

      <div className="range">
        <span>{min}</span>

        <input
          type="range"
          min={min}
          max={max}
          step="0.1"
          value={value}
          onChange={(e) =>
            onChange(Number(e.target.value))
          }
        />

        <span>{max}</span>
      </div>
    </div>
  );
}
