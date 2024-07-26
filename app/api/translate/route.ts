import { ChatOpenAI } from "@langchain/openai";
//@ts-ignore
import { PromptTemplate } from "@langchain/core/prompts";
import { kv } from '@vercel/kv';
import { NextRequest,NextResponse } from "next/server";
import { connect } from "@/lib/mongo";
import { DB } from "@/lib/constant";


export async function POST(req: NextRequest) {
    const {text,target_language} = await req.json()

    const mongo = await connect()
    // const template = await kv.get('prompt@tool-hint') as string
    // const promptData = await mongo.db(DB).collection('prompts').findOne({name:'tool_hint'})
    const template = `
    # Task
    Translate the <Text> into {target_language}.
    # Text to Translate
    {text}
    # Output Format
    Only output the translated text only. DO NOT response anything else beside the translated text.
    `
    const model = new ChatOpenAI({model: 'gpt-4o-mini',cache:true});
    const promptTemplate = PromptTemplate.fromTemplate(template);
    const chain = promptTemplate.pipe(model);
    const result = await chain.invoke(
        { text: text,target_language:target_language },)
    return NextResponse.json({result:result.content})
}