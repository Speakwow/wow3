'use server'

// @ts-ignore
import { PromptTemplate } from "@langchain/core/prompts";
import { generateObject } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';


const template = PromptTemplate.fromTemplate(
    `
adaaoufaof
{input}
`
)

export async function gen(
    input: string,
    characterName: string,
    characterPersona: string,
    level: string,
    round: string) {

    const prompt = await template.invoke({
        input: input,
    })

    const { object } = await generateObject({
        model: openai('gpt-4o'),
        schema: z.object({
            lessonConfig: z.object({
                name: z.string(),
                intro: z.string(),
                ai_role: z.string(),
                setting: z.string(),
                target_words: z.string(),
                target_sentences: z.string(),
                welcomeMessage: z.string(),
                flow: z.string(),
            }),
        }),
        prompt: prompt.toString(),
    });
    console.log(object.lessonConfig)
    return object.lessonConfig
}