import { ChatOpenAI } from "@langchain/openai";
// @ts-ignore
import { PromptTemplate } from "@langchain/core/prompts";
import { kv } from '@vercel/kv';
import { NextRequest,NextResponse } from "next/server";

export async function POST(req: NextRequest,{ params }: { params: { scenario: string}}) {
    const data = await req.json()
    console.log('Message : '+data.content)
    const template = await kv.get('prompt@'+params.scenario) as string
    const model = new ChatOpenAI({model: 'gpt-4'});
    const promptTemplate = PromptTemplate.fromTemplate(template);
    const chain = promptTemplate.pipe(model);
    const result = await chain.invoke({ question: data.content })
    console.log(params.scenario+'Invoke Successfully:'+result.content)
    return NextResponse.json({message:result.content})
}