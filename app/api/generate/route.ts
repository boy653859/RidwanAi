import Cartesia from "@cartesia/cartesia-js";
import {NextResponse} from "next/server";
export const runtime="nodejs"; export const dynamic="force-dynamic";
const VOICES:Record<string,string>={Ridwan: "89da9de1-fa23-4598-a1d2-481817edd69a",Sadik: "1d87a960-7d27-46fe-8498-7828360fea82",Male: "2ba861ea-7cdc-43d1-8608-4045b5a41de5",Female: "59ba7dee-8f9a-432f-a6c0-ffb33666b654"};
const MODELS=new Set(["sonic-3.6","sonic-3.5","sonic-3"]);const RATES=new Set([8000,16000,24000,44100,48000]);
type Body={apiKey?:string;modelId?:string;transcript?:string;voiceName?:string;voiceId?:string;sampleRate?:number;speed?:number;volume?:number};
const clean=(s:string)=>s.replace(/[^a-zA-Z0-9_-]+/g,"_").replace(/^_+|_+$/g,"")||"Voice";
export async function POST(req:Request){
 try{
  const b=await req.json() as Body;const key=process.env.CARTESIA_API_KEY||b.apiKey?.trim();
  if(!key)return NextResponse.json({error:"No API key provided. Enter your key or set CARTESIA_API_KEY in Vercel."},{status:422});
  const model=b.modelId||"sonic-3.6", transcript=b.transcript?.trim()||"", name=b.voiceName||"Narrator", id=b.voiceId||VOICES[name], sr=b.sampleRate||44100, speed=b.speed??1, volume=b.volume??1;
  if(!MODELS.has(model))return NextResponse.json({error:"Invalid model selected."},{status:422});
  if(!transcript||transcript.length>20000)return NextResponse.json({error:"Transcript must contain 1–20,000 characters."},{status:422});
  if(!VOICES[name])return NextResponse.json({error:"Invalid voice selected."},{status:422});
  if(!id||id.startsWith("YOUR-"))return NextResponse.json({error:`Configure the Voice ID for "${name}" in app/api/generate/route.ts.`},{status:422});
  if(!RATES.has(sr)||speed<.1||speed>2||volume<.5||volume>2)return NextResponse.json({error:"Invalid sample rate, speed, or volume."},{status:422});
  const client=new Cartesia({apiKey:key});
  const response=await client.tts.generate({model_id:model,transcript,voice:{mode:"id",id},output_format:{container:"wav",encoding:"pcm_s16le",sample_rate:sr as 8000|16000|24000|44100|48000},generation_config:{speed,volume}});
  const buffer=Buffer.from(await response.arrayBuffer()), stamp=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"").replace("T","_"), filename=`RidwanAI_${clean(name)}_${stamp}.wav`;
  return new NextResponse(buffer,{headers:{"Content-Type":"audio/wav","Content-Disposition":`attachment; filename="${filename}"`,"Content-Length":String(buffer.length),"X-Filename":filename,"Cache-Control":"no-store"}});
 }catch(e){console.error(e);const message = e instanceof Error ? e.message : "Voice generation failed.";
    console.error("TTS generation error:", e);
    const status = /auth|api key|unauthorized|forbidden/i.test(message) ? 401
      : /bad request|invalid|not found/i.test(message) ? 400
      : /rate limit|too many/i.test(message) ? 429
      : 500;
    return NextResponse.json({error: message}, {status})}
}
