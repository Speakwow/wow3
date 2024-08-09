'use server';

import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { CoreMessage, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import OpenAI from "openai";
import { ReactNode } from 'react';
import { generateId } from 'ai';
import { ShowImage } from '@/components/showimage';
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN as string,
});



const systemPrompt =
`
1. You should teach the student about the target words one by one.
2. draw a reference picture before your response for better understanding.
3. You should use oil painting drawing style.
#Target Words:
Train, Olympic, Sydney
`



export interface ServerMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string;
}

export interface ClientMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  display: ReactNode;
}

export async function continueConversation(
  input: string,
  setType:any,
): Promise<ClientMessage> {
  'use server';

  const history = getMutableAIState()

  const result = await streamUI({
    model: openai('gpt-4o'),
    messages: [...history.get(), { role: 'user', content: input }],
    system:systemPrompt,
    text: ({ content, done }) => {
      if (done) {
        history.done((messages: ServerMessage[]) => [
          ...messages,
          { role: 'user', content: input },
          { role: 'assistant', content },
        ]);
      }
      return <div>{content}</div>;
    },
    tools: {
      showImage: {
        description: 'Generate an image for the conversation, use anime style',
        parameters: z.object({
          description: z
            .string()
            .describe('The description of the image'),
        }),
        generate: async ({description }) => {
          history.done((messages: ServerMessage[]) => [
            ...messages,
            {
              role: 'assistant',
              name: 'imagine',
              content: `Let's draw a picture`,
            },
            
          ]);
          console.log(history.get())
          return <ShowImage description={description} />;
        },
      },
    },
    

  });
  console.log(result)

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


const imageTemplate =
`
[Art Style]:
Use Animated Cartoon Style!!!!!
Vibrant Colors: The use of bright, vibrant colors makes the visuals lively and engaging, appealing to children.
Clean Lines: Characters and backgrounds are drawn with clean, simple lines, reducing complex details and emphasizing a cute and fun aesthetic.
Flat Design: The use of flat design techniques avoids creating depth and shadows, resulting in a clear and easy-to-understand visual presentation.
Character Design: The characters have simple yet expressive designs, capable of conveying emotions and stories through minimal expressions and actions.

`

export async function SDlighting(prompt:string){
  const output = await replicate.run(
    "bytedance/sdxl-lightning-4step:5f24084160c9089501c1b3545d9be3c27883ae2239b6f412990e82d4a6210f8f",
    {
        input: {
            width: 1024,
            height: 1024,
            prompt: prompt+imageTemplate,
            scheduler: "K_EULER",
            num_outputs: 1,
            guidance_scale: 0,
            negative_prompt: "worst quality, low quality",
            num_inference_steps: 4
        }
    }
);
console.log(output);
return output
}

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