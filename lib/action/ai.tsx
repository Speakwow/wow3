'use server';

import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { CoreMessage, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { StreamingTextResponse, generateText, tool } from 'ai';
import { z } from 'zod';
import OpenAI from "openai";
import { ReactNode } from 'react';
import { generateId } from 'ai';
import { ShowImage } from '@/components/showimage';


const systemPrompt =
    `
1. You should teach the student about the target words one by one.
2. draw a reference picture before your response for better understanding.
3. You should use oil painting drawing style.
#Target Words:
Train, Olympic, Sydney
`



export interface ServerMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClientMessage {
  id: string;
  role: 'user' | 'assistant';
  display: ReactNode;
}

export async function continueConversation(
  input: string,
): Promise<ClientMessage> {
  'use server';

  const history = getMutableAIState();

  const result = await streamUI({
    model: openai('gpt-4o'),
    messages: [...history.get(), { role: 'user', content: input }],
    text: ({ content, done }) => {
      if (done) {
        history.done((messages: ServerMessage[]) => [
          ...messages,
          { role: 'assistant', content },
        ]);
      }

      return <div>{content}</div>;
    },
    tools: {
      showImage: {
        description: 'Generate an image for the conversation',
        parameters: z.object({
          description: z
            .string()
            .describe('The description of the image'),
        }),
        generate: async ({ description }) => {
          history.done((messages: ServerMessage[]) => [
            ...messages,
            {
              role: 'assistant',
              content: `Let's draw a picture: ${description}`,
            },
          ]);
          return <ShowImage description={description} />;
        },
      },
    },
  });

  return {
    id: generateId(),
    role: 'assistant',
    display: result.value,
  };
}

export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    continueConversation,
  },
  initialAIState: [],
  initialUIState: [],
});

// export async function streamComponent(messages:{messages:any}) {
//     'use server';
//     let image_url = ''
//     const client = new OpenAI()
//     const result = await streamUI({
//         model: openai('gpt-4o'),
//         tools: {
//             weather: tool({
//                 description: 'Draw the image if the conversation need an image to assist',
//                 parameters: z.object({
//                     imageDescription: z.string().describe('The description of the image'),
//                 }),
//                 execute: async ({ imageDescription }) => {
//                     console.log(imageDescription)
//                     const response = await client.images.generate({
//                         model: "dall-e-3",
//                         prompt: imageDescription,
//                         n: 1,
//                         size: "1024x1024",
//                     });
//                     image_url = response.data[0].url as string;
//                     console.log(image_url)
//                     return { image_url }
//                 },
//             }),
//         },
//         system: systemPrompt,
//         messages,
//     });
//     const stream = createStreamableValue(result.textStream);
//     return { message: stream.value, data: { toolStream } };
// }

export async function dalleGen(description:string) {
  console.log('Start Gen')
  const openai = new OpenAI()
  const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: description,
      n: 1,
      size: "1024x1024",
  });
  const image_url = response.data[0].url as string;
  return image_url
}