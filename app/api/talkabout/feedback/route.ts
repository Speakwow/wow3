import OpenAI from "openai";
// @ts-ignore
import { PromptTemplate } from "@langchain/core/prompts";
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from "next/server";
import { openai } from '@ai-sdk/openai';
import {  generateObject, streamObject } from 'ai';
import { talkaboutReportSchema } from "@/lib/schema/talkabout";
import {connect} from "@/lib/mongo"
import { DB } from "@/lib/constant";
import { ObjectId } from "mongodb";
import { calculateTalkaboutSpeedScore, countWords } from "@/lib/utils";


const template = `
#Task
You are an English teacher reviewing students' English assignment. The student is asked to describe a given picture and answer specific questions related to the picture. User will provide **Student_answer** and **Given Picture** then you should assess **Student_answer** from the following determined aspects and give academic language learning feedback to help them improve their English skills. 

##Requirement##
**Given_Picture** Given_picture is what the student is talking about
**Instructions**Instructions are the instructive questions that students should answer according to the picture. In this assignment, the questions are : {instruction}
**Examplar**Examplar is a examplar of the assignment, which as a reference of  grading standard of score 90. The Examplar for this assignment is {examplar}
**Student_answer**The student's answer for the assignment
The student's English Level is :{level}. Please always consider the information provided in the given picture and student‘s English level while grading and giving feedback.

##Score RULES##
You should assess the homework according to the following standards:
- "theme_relevance_score":0<=num(theme_relevance_score)<=100
**Important rules for "theme_relevance_score": you should assess whether **Student_answer** is related to**Given_Picture** and **Instructions**.
Score 100-90: When the student fully addresses the instructive questions; offers Insightful and well-developed ideas; Clear and coherent focus throughout.
Score 89-80:When the student clearly addresses the topic; well-developed ideas; Mostly coherent focus.
Score 79-70:Addresses the topic;Moderately developed ideas;Somewhat coherent focus.
Score 69-60:Partially addresses the topic;Poorly developed ideas;Limited coherence.
Score 59-0:Does not address the topic;Very poorly developed ideas;No coherence.

- "vocabulary_score": 0<=num(vocabulary_score)<=100
Score 100-90: Rich and varied vocabulary; Appropriate and accurate word choice; Effective use of advanced and idiomatic expressions
Score 89-80: Good range of vocabulary; Mostly accurate word choice; Some use of advanced expressions
Score 79-70: Adequate range of vocabulary,Some inaccurate word choices,Limited use of advanced expressions
Score 69-60: Limited range of vocabulary; frequent inaccurate word choices; little to no use of advanced expressions
Score 59-0: Very limited vocabulary;Persistent inaccurate word choices;No use of advanced expressions

- "grammarza_syntax_score":0<=num(vocabulary_score)<=100
#Please remember that this is an oral English assignment. Assess its grammatical accuracy based on oral speaking standards rather than writing standards. Some degree of self-correction and natural oral expression is acceptable.#
Score 100-90: Complex and varied sentence structures, Consistent grammatical accuracy, Proper use of tenses and agreement
Score 89-80:Mostly varied sentence structures; Few grammatical errors; Mostly correct use of tenses and agreement
Score 79-70:Basic sentence structures; Noticeable grammatical errors; Some incorrect use of tenses and agreement
Score 69-60:Simple sentence structures; Frequent grammatical errors; Incorrect use of tenses and agreement
Score 59-0:Very simple and fragmented sentence structures; Persistent grammatical errors; Consistent incorrect use of tenses and agreement

“feedback”: Your academic language learning feedback should at least includes 3 parts
- What did the student do well? What should the student improve?
- Judge the overall content relevance and story telling skill of the homework
- Mention if there is any obvious vocabulary or grammar mistakes, mention the most serious ones. And give the correction of it.

Your feedback MUST be less than 80 words.
#You should give appropriate feedback according to  user's CEFR English level. Remember this is oral English homework. You should judge it with Oral-speaking standard instead of a writing standard.
#You should both praise and criticize, use a kind teacher tone in Chinese. You MUST only respond with the feedback itself! You MUST respond with <Chinese>! 你必须使用中文回复！
#User Level
The student level is {level} level.

#Output Format:
{
  "vocabulary_score":"" #<Score number of the vocabulary accuracy,0-100>
  "theme_relevance_score":"" #<Score number of the theme relevance,0-100>
  "grammarza_syntax_score":"" #<Score number of Grammatical accuracy,0-100>,
  "feedback":"" #<Feedback text>"
}

`

export async function POST(req: NextRequest) {
  const {user_answer,threadId} = await req.json()
  // const template = await kv.get('prompt@correct') as string
  console.log(user_answer)
  const systemTemplate = PromptTemplate.fromTemplate(template)
  const mongo = await connect()
  const talkabout = await mongo.db(DB).collection('talkabouts').findOne({_id:new ObjectId(threadId as string)})
  if(!talkabout){
    return NextResponse.json({error:`Cannot find talkabout ${threadId}`})
  }
  const systemMessage = await systemTemplate.format({
    instruction:talkabout.instruction,
    level:talkabout.level,
    examplar:talkabout.examplar
  })
  const word_per_second = countWords(user_answer)/(+talkabout.answer_time)
  const speed_score = calculateTalkaboutSpeedScore(word_per_second)
  const {object} = await generateObject({
    model: openai('gpt-4o'),
    schema: talkaboutReportSchema,
    system: systemMessage,
    messages:[
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `**Student_Answer**: ${user_answer} \n **Given_Picture**:`,
          },
          {
            type: 'image',
            image: new URL(
              talkabout.image_url,
            ),
          },
        ],
      },
    ],
  });
  const result = {
    score:+(0.4*object.theme_relevance_score+0.2*object.grammarza_syntax_score+0.2*object.vocabulary_score+0.2*speed_score).toFixed(2),
    ...object,
    speed_score:speed_score
  }

  return NextResponse.json(result)

}