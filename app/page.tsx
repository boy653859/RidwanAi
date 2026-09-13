"use client";
import { useState } from "react";
const VOICES = { Mizanur: "89da9de1-fa23-4598-a1d2-481817edd69a", Ridwan: "6c7c6759-5478-418e-bae1-518fa639a594", "Voice 3": "YOUR-VOICE-ID" } as const;
const models = [["sonic-3.6", "Sonic 3.6"], ["sonic-3.5", "Sonic 3.5"], ["sonic-3", "Sonic 3"]];
const rates = [8, 16, 24, 44.1, 48];

export default function Home() {
    const [apiKey, setApiKey] = useState(""), [show, setShow] = useState(false), [model, setModel] = useState("sonic-3.6"), [voice, setVoice] = useState<keyof typeof VOICES>("Ridwan"), [text, setText] = useState(""), [rate, setRate] = useState(44100), [speed, setSpeed] = useState(1), [volume, setVolume] = useState(1), [loading, setLoading] = useState(false), [msg, setMsg] = useState(""), [err, setErr] = useState(false), [url, setUrl] = useState(""), [file, setFile] = useState("");
    async function generate() {
        setMsg(""); setUrl(""); setFile(""); setErr(false);
        if (!apiKey.trim()) return setErr(true), setMsg("Please enter your API key.");
        if (!text.trim()) return setErr(true), setMsg("Please enter some text first.");
        if (VOICES[voice].startsWith("YOUR-")) return setErr(true), setMsg(`Add the Voice ID for "${voice}" in app/api/generate/route.ts.`);
        setLoading(true); setMsg("Creating your voice...");
        try {
            const r = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ apiKey, modelId: model, transcript: text, voiceName: voice, voiceId: VOICES[voice], sampleRate: rate, speed, volume }) });
            if (!r.ok) { const d = await r.json().catch(() => null); throw Error(d?.error || "Generation failed.") }
            const u = URL.createObjectURL(await r.blob()), n = r.headers.get("X-Filename") || "RidwanAI_Voice.wav"; setUrl(u); setFile(n); setMsg("Your voice is ready.");
        } catch (e) { setErr(true); setMsg(e instanceof Error ? e.message : "Something went wrong.") } finally { setLoading(false) }
    }
    return <main className="shell">
        <header><div className="brand"><div className="logo">R</div><div><b>RidwanAI</b><small>Text to Voice Generator</small></div></div><div className="ready"><i /> Ready</div></header>
        <section className="hero"><p>VOICE STUDIO</p><h1>Turn your text into natural voice.</h1><span>Create speech with simple controls and download your audio instantly.</span></section>
        <section className="card">
            <div className="head"><div><h2>Voice settings</h2><small>Configure your voice and output.</small></div><em>● Private request</em></div>
            <label>API KEY</label><div className="key"><input type={show ? "text" : "password"} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Paste your API key" /><button onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button></div><small className="hint">Used only for the current generation request.</small>
            <div className="grid">
                <Field label="MODEL"><select value={model} onChange={e => setModel(e.target.value)}>{models.map(x => <option key={x[0]} value={x[0]}>{x[1]}</option>)}</select></Field>
                <Field label="VOICE"><select value={voice} onChange={e => setVoice(e.target.value as keyof typeof VOICES)}>{Object.keys(VOICES).map(x => <option key={x}>{x}</option>)}</select></Field>
            </div>
            <div className="labelrow"><label>TRANSCRIPT</label><small>{text.length.toLocaleString()} / 20,000</small></div><textarea maxLength={20000} value={text} onChange={e => setText(e.target.value)} placeholder="Write something you want to hear..." />
            <hr /><h3>Output</h3>
            <div className="grid">
                <Field label="FORMAT"><select disabled value="wav" onChange={() => { }}><option>WAV</option></select></Field>
                <Field label="SAMPLE RATE"><select value={rate} onChange={e => setRate(Number(e.target.value))}>{rates.map(x => <option key={x} value={x}>{x.toLocaleString()} kHz</option>)}</select></Field>
            </div>
            <div className="grid">
                <Range label="SPEED" value={speed} min={.1} max={2} onChange={setSpeed} /><Range label="VOLUME" value={volume} min={.5} max={2} onChange={setVolume} />
            </div>
            <button className="generate" disabled={loading} onClick={generate}>{loading ? "◌ Creating voice..." : "✦ Generate Voice"}</button>
            {msg && <div className={err ? "error" : "success"}>{msg}</div>}
            {url && <section className="result"><div className="resulthead"><div><p>READY TO USE</p><h2>Your audio</h2></div><a className="download" href={url} download={file}>↓ &nbsp; Download WAV</a></div><div className="player"><div className="wav">WAV</div><div className="info"><b>{file}</b><small>WAV audio file</small></div><audio controls src={url} /></div><a className="mobileDownload" href={url} download={file}>↓ &nbsp; Download audio</a></section>}
        </section><footer>RidwanAI · Text to Voice Generator</footer>
    </main>
}
function Field({ label, children }: { label: string, children: React.ReactNode }) { return <div className="field"><label>{label}</label>{children}</div> }
function Range({ label, value, min, max, onChange }: { label: string, value: number, min: number, max: number, onChange: (n: number) => void }) { return <div className="field"><div className="labelrow"><label>{label}</label><small>{value.toFixed(1)}</small></div><div className="range"><span>{min}</span><input type="range" min={min} max={max} step=".1" value={value} onChange={e => onChange(Number(e.target.value))} /><span>{max}</span></div></div> }
