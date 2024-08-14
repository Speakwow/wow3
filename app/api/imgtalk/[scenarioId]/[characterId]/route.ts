// @ts-ignore
import { PromptTemplate } from "@langchain/core/prompts";
import { NextRequest, NextResponse } from "next/server";
import { openai } from '@ai-sdk/openai';
import { StreamingTextResponse, streamText,tool } from 'ai'
import { convertToCoreMessages } from 'ai';;
import { z } from 'zod';
import OpenAI from "openai";
import { connect } from "@/lib/mongo";
import { DB } from "@/lib/constant";

export const maxDuration = 60;

const class_template = `
###Overall_Rules_to_follow
1. Engage with me (the student) in a {length}-round English teaching lesson.
2. In our conversation, you will take on the role of {ai_role}, during the teaching process, please always stick to your role.
3. Use {level} vocabulary to make it easier for the student to understand.
    3a. {level} is based on the Common European Framework of Reference for Languages (CEFR), you can get further info in ###References.
4. Aim to guide the student to master <Target vocabulary> , <Target sentence structures> and <Keypoints>.
    4a. If the student had already grasp all the target above, try to teach <Additional target> if you still have enough rounds of dialouge.
5. Regularly provide short, positive feedback to encourage the student.
6. Begin the lesson with interactive questions to engage the student's attention.
7. You must use the marterials from <Setup> to process the lesson.
8. The conversation should be related to the topic: {topic}.
9. Remember to maintain the lesoon process by the dialogue <Flow>.
    8a. Ensure to complete {length} rounds of dialouge; do not end the conversation early.
    8b. Conversations that are not related to the teaching target do not count in the <Flow>.

##Adjustments_to_Address_Specific_Issues
1. If the student response is not standard, you should repeat the correct it and then encourage him to try again.
e.g. "Now，can you say...?"
2. Instead of relying on yes/no questions, use open-ended questions to foster longer responses and deeper engagement.
For instance, instead of asking "Do you know what a guitar is?" ask "What kind of music do you like?" or "Tell me about your favorite instrument."

###student's_Profile

{profile}

###Input_Conditions

- Flow: {flow}
- Topic: {topic}
- Setup: {setup}
- Target vocabulary: {target_words}
- Target sentence structures: {target_sentences}
- Keypoints:{keypoints}
- Additional target: {additional_target}
- AI role: {ai_role}
- AI Persona: {persona}

###Output_format

"Hello! How are you today?"

- Each round's reply length limit is = 20 words.
- You must wait for the user's response before proceeding to the next round of dialogue.
- Use more modal to act as real as possible.

`

const profile = `
- Age:13,
- Native Language: Chinese
- Level: CEFR A2, Can understand sentences and frequently used expressions related to areas of most immediate relevance (e.g. very basic personal and family information, shopping, local geography, employment). Can communicate in simple and routine tasks requiring a simple and direct exchange of information on familiar and routine matters.  Can describe in simple terms aspects of his/her background, immediate environment and matters in areas of immediate need.
`

export async function generateStaticParams() {
  const mongo = await connect()
  const [scenarios, characters] = await Promise.all([
    mongo.db(DB).collection('scenarios').find().toArray(),
    mongo.db(DB).collection('characters').find().toArray(),
  ])
  const params = scenarios.flatMap((scenario) => 
    characters.map((character) => ({
      scenarioId: scenario._id.toString(),
      characterId: character._id.toString(),
    }))
  );

  return params
}

export async function POST(req: NextRequest) {
  let { messages, scenario, character } = await req.json();
  scenario = await JSON.parse(scenario)
  character = await JSON.parse(character)
  const imgUrl = scenario.referenceImage
  const promptTemplate = PromptTemplate.fromTemplate(class_template);
  const systemPrompt = await promptTemplate.invoke(
    {
      profile: profile,
      persona: character.brief,
      topic:scenario.topic??'',
      ai_role: scenario.ai_role??'',
      setup: scenario.setup??'',
      target_words: scenario.target_words??'',
      target_sentences: scenario.target_sentences??'',
      additional_target:scenario.additional_target ??'',
      keypoints: scenario.keypoints??'',
      length: scenario.length as string,
      level: scenario.level??'CEFR A1',
      flow: scenario.flow as string,
    }
  )

  const imgMessage = {
    role: "user",
    content: [
      {type: "text", text: systemPrompt.toString()},
      {type: "image",image: new URL(imgUrl)},
    ],
  }
  // const imgMessage = {
  //   role: "user",
  //   content: systemPrompt
  // }

  const welcomeMessage = {
    role:"assistant",
    content:scenario.welcomeMessage
  }
  messages.unshift(imgMessage,welcomeMessage );


  const client = new OpenAI();
  const result = await streamText({
    model: openai('gpt-4o'),
    messages:messages,
  });
  return new StreamingTextResponse(result.toAIStream());
}
// export async function POST(req: NextRequest,{ params }:{ params: { scenarioId:string,characterId:string }}) {
//     const data = await req.json()
//     console.log('Message : '+data.content)
//     // const template = await kv.get('prompt@tool-hint') as string



//     const model = new ChatOpenAI({model: 'gpt-4'});
//     console.log('Invoke Hint Successfully:'+result.content)
//     return NextResponse.json({message:result.content})
// }