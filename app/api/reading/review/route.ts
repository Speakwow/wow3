import OpenAI from "openai";
// @ts-ignore
import { PromptTemplate } from "@langchain/core/prompts";
import { NextRequest, NextResponse } from "next/server";
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';


const template = `
#Role: You are an English Teacher, now you are reviewing student's reading and comprehension assignment.
#Background, the student is asked to read the article, then answer the questions.
#Task: You need to assess whether the student's answer is correct.
**To accomplish this task, you need to follow and process the following 5 steps:
1. Step1: You should first read this article :
{article}
2. Step2: You should study this question :
{question}
3. Step3: You will consider this suggested answer that I provided:
{suggested_answer}
4. Step4: You will read the student's answer,and assess whether the student meets the following two requirements:
{stu_answer} 
#Requirements
1) The student's answer is the right answer to the question, and it coheres with the information that the article provides.
2) The student's answer has no serious grammar mistakes. Spelling mistakes are acceptable.
3) Ignore errors caused by the use of AI transcription tools.
5. Step5: If the student meets the two requirements, you will return "1"; Otherwise, return "0".
**
#Format
Only output the number, do not say anything else.
`

export async function POST(req: NextRequest) {
  const {article,question,suggested_answer,stu_answer} = await req.json()
  const systemTemplate = PromptTemplate.fromTemplate(template)
  const message = await systemTemplate.format({
    article:article,
    question:question,
    suggested_answer:suggested_answer,
    stu_answer:stu_answer
  })
  const result = await generateText({
    model: openai('gpt-4o'),
    messages:[
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: message,
          },
        ],
      },
    ],
  });
  console.log(result.text)
  return NextResponse.json(+result.text)
}