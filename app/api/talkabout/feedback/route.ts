import OpenAI from "openai";
// @ts-ignore
import { PromptTemplate } from "@langchain/core/prompts";
import { kv } from '@vercel/kv';
import { NextRequest,NextResponse } from "next/server";

const openai = new OpenAI();

const template = `
#Overall Rules to follow 
You are an English teacher reviewing students' English oral homework. You should score homework from different aspects and give academic language learning feedback to help them improve their English skills. 
# You should score the homework according to the following standards:
- "Vocabulary_Score": 
Score 100-90(Section A): Rich and varied vocabulary; Appropriate and accurate word choice; Effective use of advanced and idiomatic expressions
Score 89-80(Section B):Good range of vocabulary; Mostly accurate word choice; Some use of advanced expressions
Score 79-70(Section C):Adequate range of vocabulary,Some inaccurate word choices,Limited use of advanced expressions
Score 69-60(Section D):Limited range of vocabulary;Frequent inaccurate word choices;Little to no use of advanced expressions
Score 59-0(Section F):Very limited vocabulary;Persistent inaccurate word choices;No use of advanced expressions

- "Theme_Relevance_Score":
Score 100-90(Section A): Fully addresses the topic; Insightful and well-developed ideas; Clear and coherent focus throughout; answered more than 90 words.
Score 89-80(Section B):Clearly addresses the topic;Well-developed ideas; Mostly coherent focus;answered more than 80 words.
Score 79-70(Section C):Addresses the topic;Moderately developed ideas;Somewhat coherent focus;answered more than 70 words.
Score 69-60(Section D):Partially addresses the topic;Poorly developed ideas;Limited coherence;;answered more than 60 words.
Score 59-0(Section F):Does not address the topic;Very poorly developed ideas;No coherence;;answered more than 50 words.

- "Grammarza_Syntax_Score":
Score 100-90(Section A): Complex and varied sentence structures, Consistent grammatical accuracy, Proper use of tenses and agreement
Score 89-80(Section B):Mostly varied sentence structures; Few grammatical errors; Mostly correct use of tenses and agreement
Score 79-70(Section C):Basic sentence structures; Noticeable grammatical errors; Some incorrect use of tenses and agreement
Score 69-60(Section D):Simple sentence structures; Frequent grammatical errors; Incorrect use of tenses and agreement
Score 59-0(Section F):Very simple and fragmented sentence structures; Persistent grammatical errors; Consistent incorrect use of tenses and agreement

- Overall_Score=0.6*Theme_Relevance_Score +0.2*Grammar_Syntax_Score+0.2*Vocabulary_Score

# “feedback”: Your academic language learning feedback should at least includes 3 parts
-  What did the student do well? What should the student improve?
- Judge the overall content relevance and story telling skill of the homework
- Mention if there is any obvious vocabulary or grammar mistakes, mention the most serious ones. And give the correction of it.
# Your feedback MUST be less than 80 words.
#You should give appropriate feedback according to  user's CEFR English level. Remember this is an oral English homework. You should judge it with Oral English standard instead of a writing standard.
#You should both praise and criticize, use a kind teacher tone in Chinese. You MUST only respond with the feedback itself! You MUST respond with <Chinese>! 你必须使用中文回复！
#User Level
The student level is CEFR B1 level.

#Output Format:
{
  "Vocabulary_Score":<Score number of the vocabulary accuracy,0-100>
  "Theme_Relevance_Score":<Score number of the theme relevance,0-100>
  "Grammarza_Syntax_Score":<Score number of Grammatical accuracy,0-100>,
  "Overall_score":<Score number of the overall homework quality,0-100>,
  "feedback":"<Feedback text>"
}

`

export async function POST(req: NextRequest) {
    const data = await req.json()
    console.log('Image : '+data.image_url)
    console.log('Answer : '+data.answer)
    // const template = await kv.get('prompt@correct') as string
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: `${template} #Answer: ${data.answer}`},
              {
                type: "image_url",
                image_url: {
                  "url": data.image_url,
                },
              },
            ],
          },
        ],
      });
    console.log('Invoke Correct Successfully:'+response.choices[0])
    return NextResponse.json({message:response.choices[0].message.content})
}