# RidwanAI — Cartesia TTS (Next.js + TypeScript)

Vercel/Netlify-friendly web app using `@cartesia/cartesia-js`.

## Features

- Cartesia API key input
- Sonic 3.6 / 3.5 / 3
- Multiple named Voice IDs
- Transcript
- WAV / PCM S16LE
- 8000 / 16000 / 24000 / 44100 / 48000 Hz
- Speed 0.1–2.0
- Volume 0.5–2.0
- Browser audio player
- Download
- Filename: `RidwanAI_<VoiceName>_<YYYYMMDD_HHMMSS>.wav`

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Add your voices

Edit `app/api/generate/route.ts`:

```ts
const VOICES = {
  Narrator: "89da9de1-fa23-4598-a1d2-481817edd69a",
  "My Voice": "YOUR-VOICE-ID"
};
```

## Deploy

Push to GitHub and import the repository into Vercel or Netlify.

If using your own server-side Cartesia API key, add:

`CARTESIA_API_KEY`

to the deployment environment variables.

## Security

The default UI accepts a user's API key and sends it over HTTPS to the API route for that request. The server code does not persist it.

For a public app where YOU pay for all generations, prefer `CARTESIA_API_KEY` as a server-side environment variable and add authentication/rate limiting before exposing the endpoint publicly.
