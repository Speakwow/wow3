
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { kv } from '@vercel/kv';
import { NextRequest,NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    const data = await req.json()
    console.log('Message : '+data.content)
    const template = await kv.get('prompt@tool-hint') as string
    const model = new ChatOpenAI({model: 'gpt-4o'});
    const promptTemplate = PromptTemplate.fromTemplate(template);
    const chain = promptTemplate.pipe(model);
    const result = await chain.invoke({ question: data.content })
    console.log('Invoke Hint Successfully:'+result.content)
    return NextResponse.json({message:result.content})
}