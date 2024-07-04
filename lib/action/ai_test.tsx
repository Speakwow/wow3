'use server';

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { ShowImage } from '@/components/showimage';
import { SDlighting } from './ai';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const systemPrompt =
`
1. You should teach the student about the target words one by one.
2. draw a reference picture before your response for better understanding.
3. You should use oil painting drawing style.
#Target Words:
Train, Olympic, Sydney
`

export async function continueConversation(history: Message[]) {
  'use server';

  const { text, toolResults } = await generateText({
    model: openai('gpt-4o'),
    system: systemPrompt,
    messages: history,
    tools: {
      showImage: {
        description: 'Generate an image for the conversation, use anime style',
        parameters: z.object({
            description: z
              .string()
              .describe('The description of the image'),
          }),
        execute: async ({ description }) => {
            const output =  await SDlighting(description)
            console.log(output);
            //@ts-ignore
            
          return {type:'image',value:output[0]};
        },
      },
    },
  });

  return {
    messages: [
      ...history,
      {
        role: 'assistant' as const,
        content:
          text || toolResults.map(toolResult => toolResult.result).join('\n'),
      },
    ],
  };
}