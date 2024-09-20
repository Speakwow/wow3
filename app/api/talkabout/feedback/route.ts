import OpenAI from "openai";
// @ts-ignore
import { PromptTemplate } from "@langchain/core/prompts";
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from "next/server";
import { openai } from '@ai-sdk/openai';
import {  generateObject, streamObject } from 'ai';
import { talkaboutReportSchema } from "@/lib/schema/talkabout";
import {connect, connectCore} from "@/lib/mongo"
import { DB, DB_CORE } from "@/lib/constant";
import { ObjectId } from "mongodb";
import { calculateTalkaboutSpeedScore, countWords } from "@/lib/tools";


const template = `
#Task
You are an English teacher reviewing students' English assignment. The student is asked to describe a given picture and answer specific questions related to the picture. User will provide **Student_answer** and **Given Picture** then you should assess **Student_answer** from the following determined aspects and give academic language learning feedback to help them improve their English skills. 

##Requirement##
**Given_Picture** Given_picture is what the student is talking about
**Instructions**Instructions are the instructive questions that students should answer according to the picture. In this assignment, the questions are : {instruction}
**Examplar**Examplar is a examplar of the assignment, which as a reference of  grading standard of score 90.  The Examplar for this assignment is {examplar}
**Student_answer**The student's answer for the assignment
**Student_age**The student's age is 12 years-old.
The student's English Level is :{level}. Please always consider student‘s English level and his age while grading and giving feedback.
If the student fully achieves the requirement at his age, he should be grade above 80.
If the student is way beyond the requirement at his age, he should be grade above 90.
If the student almost achieves the requirement at his age, he should be grade 75-80.
If the student does not achieve the requirement at his age, he should be grade below 70.

##Score RULES##
You should assess the homework according to the following standards:
- "theme_relevance_score":0<=num(theme_relevance_score)<=100
*Important rules for "theme_relevance_score": you should assess whether **Student_answer** is related to**Given_Picture** and **Instructions**.
*Important rules for "theme_relevance_score": if the**Instructions**'s question is not directly shown in the picture, you could allow students to have their own thoughts on that question. 

Score 100-90: If **Student_answer**accorded with the information shown in the **Given_Picture**, and **Student_answer**answered every question in the  **Instructions** .
Score 89-80: If **Student_answer**accorded with the information shown in the **Given_Picture**, but **Student_answer**answered only part of the questions in the  **Instructions** .
Score 79-70: If the student somehow misunderstood **Given_Picture**and gave answers which are not aligned with **Given_Picture**. The student misunderstood **Instructions**, and gave wrong answers to the questions.
Score 69-60: If the student was not able to understand/ describe the **Given_Picture** , continuously gave wrong answers compared to what was shown in the **Given_Picture**.
Score 59-0: If the student was not able to understand/ describe the **Given_Picture** and not able to respond to **Instructions**.

- "coherence_score": 0<=num(coherence_score)<=100
Score 100-90: When the student fully addresses the instructive questions; offers Insightful and well-developed ideas; Clear and coherent focus throughout.
Score 89-80:When the student clearly addresses the topic; well-developed ideas; Mostly coherent focus.
Score 79-70:Addresses the topic;Moderately developed ideas;Somewhat coherent focus.
Score 69-60:Partially addresses the topic;Poorly developed ideas;Limited coherence.
Score 59-0:Does not address the topic;Very poorly developed ideas;No coherence.

- "vocabulary_score": 0<=num(vocabulary_score)<=100
#Please remember the student's English level while judging his vocabulary
Score 100-90: The student shows the appropriate and accurate word choice in his English Level. Less than 8 wrong word choices. 
Score 89-80: The student's word choices are mostly accurate and appropriate, 9-15 wrong word choices.
Score 79-70: 16-20 inaccurate word choices,Limited use of advanced expressions.
Score 69-60: More than 20 inaccurate word choices; little to no use of advanced expressions
Score 59-0: Persistent inaccurate word choices.

- "grammarza_syntax_score":0<=num(grammarza_syntax_score)<=100
#Please assess the grammatical accuracy score based on speaking standards, which means some oral mistakes are acceptable. #
Score 100-90: Consistent grammatical accuracy, Proper use of tenses and agreement.Some degree of self-correction and natural oral expression is acceptable.Less than 5 grammatical errors.
Score 89-80:5-10 ; Mostly correct use of tenses and agreement.
Score 79-70: Basic sentence structures; 10-13 grammatical errors; some incorrect use of tenses and agreement
Score 69-60:Simple sentence structures; 14-16 Frequent grammatical errors; Lots of Incorrect use of tenses and agreement
Score 59-0:Very simple and fragmented sentence structures; more than 16 grammatical errors; Consistent incorrect use of tenses and agreement

“feedback”: Your academic language learning feedback should at least includes 3 parts
- What did the student do well? What should the student improve?
- Judge the overall content relevance and story telling skill of the homework
- Give the correction of one of his most serious mistakes.

Your feedback MUST be less than 80 words.
#You should give appropriate feedback according to  user's CEFR English level. Remember this is oral English homework. Forget the spelling mistake, focus on sentence structure or some serious problem.
#Use a kind teacher tone in Chinese while giving advices. You MUST only respond with the feedback itself! You MUST respond with <Traditional Chinese>! 你必須使用“繁體中文”回覆！
#User Level
The student level is {level} level, and he is 12 years-old.

#Output Format:
"theme_relevance_score":"" #<Score number of the theme relevance,0-100>,
"coherence_score": #<Score number of coherence,0-100>
"vocabulary_score":"" #<Score number of the vocabulary accuracy,0-100>
"grammarza_syntax_score":"" #<Score number of Grammatical accuracy,0-100>,
"feedback":"" #<Feedback text>"
`

export async function POST(req: NextRequest) {
  const {user_answer,threadId} = await req.json()
  console.log(user_answer)
  const systemTemplate = PromptTemplate.fromTemplate(template)
  const mongo = await connectCore()
  const talkabout = await mongo.db(DB_CORE).collection('talkabouts').findOne({_id:new ObjectId(threadId as string)})
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
            text: `**Student_Answer**: ${user_answer} \n **Below is Given_Picture**:`,
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
    content_score:+(0.5*object.theme_relevance_score+0.5*object.coherence_score).toFixed(2),
    language_score:+(0.5*object.vocabulary_score+0.5*object.grammarza_syntax_score).toFixed(2),
    ...object,
    speed_score:speed_score
  }
  console.log(result)

  return NextResponse.json(result)

}