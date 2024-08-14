import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { kv } from '@vercel/kv';
import { connect } from '@/lib/mongo';
import { DB } from '@/lib/constant';


// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
 



export async function generateStaticParams() {
  const mongo = await connect()
  const [sceanrios, ] = await Promise.all([
    mongo.db(DB).collection('scenarios').find().toArray(),

  ])
  return sceanrios.map((sceanrio) => (
      {
        scenario: sceanrio._id.toString(),
      }
    ))
}
 
export async function POST(req: Request,{ params }:{ params: { scenario:string }}) {

  const { messages } = await req.json();
  const scenario = await kv.hgetall('scenario@'+params.scenario) 
  
  // Merge Message List
  const systemMessage = {
    role:"system",
    content:scenario?.prompt
  }
  const welcomeMessage = {
    role:"assistant",
    content:scenario?.welcomeMessage
  }
  messages.unshift(systemMessage,welcomeMessage);

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages,
  });
 
  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}