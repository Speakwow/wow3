import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { kv } from '@vercel/kv';

const welcomeMessage = {
  role:"assistant",
  content:"Hi, I am Marina the Mermaid, how are you doing?"
}
 
// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
 
// Set the runtime to edge for best performance
export const runtime = 'edge';
 
export async function POST(req: Request) {

  const { messages } = await req.json();
  const template = await kv.get('prompt@hobby') as string
  // console.log(template)
  const systemMessage = {
    role:"system",
    content:template
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