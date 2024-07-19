'use server'

// @ts-ignore
import { PromptTemplate } from "@langchain/core/prompts";
import { generateObject } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { ChatOpenAI } from "@langchain/openai";
// @ts-ignore
import { RunnableSequence } from "@langchain/core/runnables";
// @ts-ignore
import { StructuredOutputParser, CustomListOutputParser } from "langchain/output_parsers";
// @ts-ignore
import { StringOutputParser } from "@langchain/core/output_parsers";


export async function genScenarioTarget(
    topic: string,
    goal: string,
    level: string,
) {
    console.log('==== Start Gen 1 ====')
    const template = `
    ##Task## I am practicing English and you are my English Tutor. Please list "10" useful English words and "5 useful expressions" related to the topic: {topic} and the Learning goal:{learning_goal}
    ##Rules## You should provide words that are not too difficult and not too easy according to my CEFR English level, which is {level}. ONLY OUTPUT THE RESULT according to the ##Format## below, don't say anything else. 
    ##Format## 
    {format_instructions}
    ##Examplar##
    If the topic is Supermarket Shopping, and the learning goal is learn how to purchase things in a supermarket, the student's English level is CEFR  A2.
    Your OUTPUT should be like:
    "target_words":"aisle,cart,checkout,dairy,bakery,frozen,canned,coupon,receipt,fresh",
    "target_sentences":"Where can I find [item]/Do you have any fresh [produce]/Can I pay with [credit card]/Could you help me with this?/Do you have any more in stock?",
    `
    const parser = StructuredOutputParser.fromZodSchema(
        z.object({
            target_words: z.array(z.string().describe("useful English word related to the topic and goal")),
            target_sentences: z
                .array(z.string())
                .describe("useful expressions related to the topic and goal"),
        })
    );

    const chain = RunnableSequence.from([
        PromptTemplate.fromTemplate(
            template
        ),
        new ChatOpenAI({ model: 'gpt-4o' }),
        parser,
    ]);
    const maxRetries = 5
    let attempts = 0;
    while (attempts < maxRetries) {
        try {
            const res = await chain.invoke({
                topic: topic,
                learning_goal: goal,
                level: level,
                format_instructions: parser.getFormatInstructions()
            })
            return res
        } catch (error) {
            attempts++;
            console.error(`Attempt ${attempts} failed:`, error);

            if (attempts >= maxRetries) {
                throw new Error('Maximum retries reached');
            }
        }
    }
}

export async function genScenarioBasic(
    topic: string,
    goal: string,
) {
    console.log('==== Start Gen 2 ====')
    const template = `
    ##ROLE##: You are a creative writer, who is good at writing dialogues for teenagers to learn English, you always create interesting daily scenes that best suit our teaching topics and learning goals. Your audience are Chinese teenagers.
    ##TASK## 
    Create a daily scene that best suits our teaching topics:{topic}and learning goals:{learning_goal}.
    1. Give the scene a Chinese Name, which best concludes the topic of the scene and has no more than 8 chinese characters. Output as "name":"超市折扣日",
    2. Tell the audience a brief introduction of the scene in Chinese, which may including the background information, what happened. You will summarize and highlight the interesting part of the scene, and output no more than 20 Chinese characters.  Output as "intro":"适逢暑假，超市决定举办大甩卖啦",
    3. You will create an interesting main-character related to this scene and our topics, a character that will be fun to talk with. Write a brief introduction of this main character including his/her occupation and personality, no more than 30 Chinese words. Output as  "ai_role":"超市售货员，她喜欢热情地推销商品",
    4. Create an iconic line for the main-character when it says Hello,it should fit for its charateristic Output as "welcomeMessage":"Hola! It’s a perfect day for shopping,how are you?",
    5. Write a detailed scene description in Chinese, which may includes the the conversation is between who and who ;background information(where/when/what) happened in this scene, what language knowledge and topics can be learned in this scene. No more than 200 Chinese words. Output as "setting":"这是一段发生在超市售货员和顾客之间的对话。暑假期间，超市决定举办大甩卖，热情的售货员在向顾客推销打折商品。涉及购买商品、打折促销、询问商品信息等话题。",
    ##RULES## ONLY OUTPUT THE RESULT according to the ##Format## below, don't say anything else. 
    ##Format## 
    {format_instructions}
    ##Examplar##
    If the topic is Supermarket Shopping, and the learning goal is learn how to purchase things in a supermarket.
    Your OUTPUT should be like:
    "name":"超市折扣日",
    "intro":"适逢暑假，超市决定举办大甩卖啦",
    "ai_role":"超市售货员，她喜欢热情地推销商品",
    "welcomeMessage":"Hola! It’s a perfect day for shopping,how are you?",
    "setting":"这是一段发生在超市售货员和顾客之间的对话。暑假期间，超市决定举办大甩卖，热情的售货员在向顾客推销打折商品。涉及购买商品、打折促销、询问商品信息等话题。",
    `
    const parser = StructuredOutputParser.fromZodSchema(
        z.object({
            name: z.string().describe("a Chinese Name for the scene, which best concludes the topic of the scene and has no more than 8 chinese characters"),
            setting: z.string().describe("a detailed scene description in Chinese, which may includes the the conversation is between who and who ;background information(where/when/what) happened in this scene, what language knowledge and topics can be learned in this scene. No more than 200 Chinese words."),
            intro: z.string().describe("a brief introduction of the scene in Chinese, which may including the background information, what happened. You will summarize and highlight the interesting part of the scene, and output no more than 20 Chinese characters."),
            welcomeMessage: z.string().describe("an iconic line for the main-character when it says Hello,it should fit for its charateristic, must in English"),
            ai_role: z.string().describe("an interesting main-character related to this scene and our topics, a character that will be fun to talk with. Write a brief introduction of this main character including his/her occupation and personality, no more than 30 Chinese words.")
        })
    );
    const chain = RunnableSequence.from([
        PromptTemplate.fromTemplate(
            template
        ),
        new ChatOpenAI({ model: 'gpt-4o' }),
        parser,
    ]);
    const maxRetries = 5
    let attempts = 0;
    while (attempts < maxRetries) {
        try {
            const res = await chain.invoke({
                topic: topic,
                learning_goal: goal,
                format_instructions: parser.getFormatInstructions()
            })
            return res
        } catch (error) {
            attempts++;
            console.error(`Attempt ${attempts} failed:`, error);

            if (attempts >= maxRetries) {
                throw new Error('Maximum retries reached');
            }
        }
    }
}

export async function genScenarioFlow(
    topic: string,
    goal: string,
    level: string,
    characterName: string,
    ai_role: string,
    round: string,
    setting: string,

) {
    console.log('==== Start Gen 2 ====')
    const template = `
    ##TASK##
    Generate a {round} round conversation flow, which guides me to step-by-step go through the topic, from shallow to deep discussion, from general questions to detailed deep dive. 
    
    ##REQUIREMENT## You need to breakdown a {round} conversation into 5 sections.You should provide me with a detailed conversation flow based on the following information and the general rules:
    YourName:{characterName}, This is your name. You will always introduce yourself in the first round of the conversation.
    YourRole : {ai_role}, this is your role, you should stay in this role the whole time. 
    Scene setting: {setting}, you should create the conversation based on this scene.
    Learning goals:{learning_goal}, you should create a flow that best achieves the learning goals. 
    
    General Rules: 
    In section 1, you will introduce your role and ask general ice-breaking questions related to the topic and the scene setting;
    In Section 2, you will start with some general ideas related to the topics; 
    In Section 3, you will bring in some useful words/phrases in this scenario to help me improve my English ; 
    In Section 4, you need to encourage me to think/talk more about the topics based on my previous answer or strength my knowledge of the topic and target expression;
    In Section 5, try to conclude and end the conversation in the last three rounds. You can highlight the nice points during the conversation or encourage me and make me feel good. You MUST finish the Conversation at Round {round} by Saying "WOW, It was nice talking to you, but let's save more for next time"
    
    ##RULE##
    I need you to breakdown the conversation into 5 sections. You need to summarize what you can say in different rounds, REMEMBER you should stay in your role while make sure you fullfill all the teaching goals. BUT DONT write specific sentences and lines. ONLY OUTPUT the guidance of the conversation flow. REMEBER Your audience is at English Level: {level}.
    ONLY OUTPUT THE RESULT according to the ##Format## below, don't say anything else.
    
    ##FORMAT##
    {format_instructions}
    
    ##EXAMPLAR##
    
    "Rounds 1-3: Introduce yourself and ask about the learner's name, while staying in character as Alex the Tech Enthusiast to establish the Tech Expo scenario.",
    "Rounds 4-6: Gradually transition to and discussing general technology topics.",
    "Rounds 7-12: Focus on specific projects and innovations the learner is interested in.",
    "Rounds 13-16: Engage in discussions about future trends and the learner’s opinions on them.",
    "Rounds 17-20: Conclude the conversation by summarizing what was learned and saying WOW, It was nice talking to you, but let's save more for next time in the last round"
    
    `
    const parser = new CustomListOutputParser({ length: 5, separator: "\n" })
    const chain = RunnableSequence.from([
        PromptTemplate.fromTemplate(
            template
        ),
        new ChatOpenAI({ model: 'gpt-4o' }),
        parser,
    ]);
    const maxRetries = 5
    let attempts = 0;
    while (attempts < maxRetries) {
        try {
            const res = await chain.invoke({
                topic: topic,
                learning_goal: goal,
                round: round,
                characterName: characterName,
                level: level,
                setting: setting,
                ai_role: ai_role,
                format_instructions: parser.getFormatInstructions()
            })
            return res
        }
        catch (error) {
            attempts++;
            console.error(`Attempt ${attempts} failed:`, error);

            if (attempts >= maxRetries) {
                throw new Error('Maximum retries reached');
            }
        }
    }
}


export async function genWriteFeedback(
    content: string,
    task: string,
    level: string,
    word_count: string

) {
    const template = `
##ROLE##
You are an English teacher who is reviewing students' English writing homework. You should score the homework from different aspects and give academic language learning feedback to help them improve their English writing skills. 

##Requirement##

The task/topic/question of this writing homework is:{writing_task}
The student's writing homework is:{student_essay}
The student's English Level is :{Level}
Please always consider the homework requirement and student level while grading and giving feedback.

**TASK 1** PROVIDE 4 SCORES 
You should consider the task of the homework, then score the writing homework in 4 aspects according to the following standards：
Content Score
Content Score is used to measure whether the candidate answered the writing task. They have done what they were asked to do.It's an integer number between 0-100. 
You should grade the Content Score by the following standards:
Score 100-90(Section A): All content is relevant to the task. Target reader is fully informed. 
Score 89-80(Section B):Minor irrelevances and/or omissions may be present. Target reader is on the whole informed. Answered more than {required_words} words.
Score 79-70(Section C):Some irrelevances and/or omissions may be present. The target reader is generally informed but may require some effort to understand the message. Answered less than  {required_words} words.
Score 69-60(Section D):Irrelevances and misinterpretation of task may be present. Target reader is minimally informed. Answered less than  {required_words} words.
Score 59-0(Section F):Content is totally irrelevant. Target reader is not informed. Answered less than  {required_words} words.
*Output as 
"content_score":num,<0-100>

Communicative Achievement Score
Communicative Achievement Score is used to measure whether the writing is appropriate for the task. The candidate has used a style which is appropriate for the specific communicative context.  The writing is appropriate for the target reader. It's an integer number between 0-100. 
You should grade the Communicative Achievement Score by the following standards:
Score 100-90(Section A): Uses the conventions of the communicative task to hold the target reader’s attention and communicate straightforward ideas.
Score 89-80(Section B):Text is connected and coherent, using basic linking words and a limited number of cohesive devices.
Score 79-70(Section C):Text is generally connected and coherent, using basic linking words and some cohesive devices. The use of cohesive devices may be somewhat limited but sufficient to maintain a logical flow.
Score 69-60(Section D):Produces text that communicates simple ideas in simple ways.
Score 59-0(Section F):They have written in a way that is not suitable.
*Output as "communicativeachievement_score":num,<0-100>

Organisation Score
Organisation Score is used to measure whether the writing is put together well. It is logical and ordered.It's an integer number between 0-100. 
You should grade the Organisation Score by the following standards:
Score 100-90(Section A): Text is generally well organised and coherent, using a variety of linking words and cohesive devices.
Score 89-80(Section B):Text is connected and coherent, using basic linking words and a limited number of cohesive devices.
Score 79-70(Section C):Text is generally connected and coherent, using basic linking words and some cohesive devices. The use of cohesive devices may be somewhat limited but sufficient to maintain a logical flow.
Score 69-60(Section D):Text is connected using basic, highfrequency linking words.
Score 59-0(Section F):It is difficult for the reader to follow. It uses elements of organisation which are not appropriate for the genre.
*Output as "organisation_score":num,<0-100>,

Language Score
Language Score is used to measure whether there is a good range of vocabulary and grammar in the writing. They are used accurately.It's an integer number between 0-100. 
You should grade the Language Score by the following standards:
Score 100-90(Section A): Uses a range of everyday vocabulary appropriately, with occasional inappropriate use of less common lexis. Uses a range of simple and some complex grammatical forms with a good degree of control. Errors do not impede communication.
Score 89-80(Section B):Uses everyday vocabulary generally appropriately, while occasionally overusing certain lexis. Uses simple grammatical forms with a good degree of control. While errors are noticeable, meaning can still be determined.
Score 79-70(Section C):Uses everyday vocabulary appropriately for the most part, though may overuse certain lexis at times. Uses simple grammatical forms with a reasonable degree of control. Errors are noticeable and may occasionally impede meaning, but overall, the message is understandable.
Score 69-60(Section D):Uses basic vocabulary reasonably appropriately. Uses simple grammatical forms with some degree of control. Errors may impede meaning at times.
Score 59-0(Section F):Serious grammatical and vocabulary mistakes, which make it difficult for the reader to understand.
*Output as "language_score":num,<0-100>,


**TASK 2** GIVE FEEDBACK 
You should give feedback to generally respond to students' work and help them to do better, which length is about 50 words, using Chinese to write feedback and some English when necessary. REMEMBER you are a warm teacher who is writing to a 10-year-old child, so please USE a Friendly, Supportive and Encouraging TONE.

Your feedback should at least includes 3 parts
- Encourage they have accompolished the work,doing a amazing job etc. Emphasize how the student especially did well. (15-20 words in Chinese)
- Judge the overall performance of the homework. What aspects (content/ communicative achievement /organization/language) should the student improve? (10-15 words in Chinese)
- Help the student improve their performance next time. Indicate and correct one of the most serious mistakes they made, or mention an overall suggestion to help them improve. (20-40 words in Chinese and English)
*Output as "w_feedback":string

##FORMAT##
{format_instructions}

    `
    const parser = StructuredOutputParser.fromZodSchema(
        z.object({
            content_score: z.number().describe(""),
            communicativeachievement_score: z.number().describe(""),
            organisation_score: z.number().describe(""),
            language_score: z.number().describe(""),
            w_feedback:z.string().describe("Generally respond to students' work and help them to do better, which length is about 50 words, using Chinese to write feedback and some English when necessary. REMEMBER you are a warm teacher who is writing to a 10-year-old child, so please USE a Friendly, Supportive and Encouraging TONE.")
        })
    );
    const chain = RunnableSequence.from([
        PromptTemplate.fromTemplate(
            template
        ),
        new ChatOpenAI({ model: 'gpt-4o' }),
        parser,
    ]);
    const maxRetries = 5
    let attempts = 0;
    while (attempts < maxRetries) {
        try {
            const res = await chain.invoke({
                writing_task: task,
                student_essay: content,
                Level: level,
                required_words:word_count,
                format_instructions: parser.getFormatInstructions()
            })
            return {
                ...res,
                score: 0.2*res?.communicativeachievement_score + 0.5*res.content_score + 0.2*res.language_score + 0.1*res.organisation_score
            }
        }
        catch (error) {
            attempts++;
            console.error(`Attempt ${attempts} failed:`, error);

            if (attempts >= maxRetries) {
                throw new Error('Maximum retries reached');
            }
        }
    }
}




export async function improveWriting(
    content: string,
    task: string,
    level: string,
    word_count: string

) {
    const template = `
##ROLE## You are a native English speaker, good at English writing. You will help a student to improve his writing skills.
##TASK##  You are going to re-write a student essay, aim at providing a better version in the standard of no grammar mistakes, no spelling mistakes, and use native expressions. 
##REQUIREMENT##
You should first understand the requirement of the writing homework:{task},this essay should be over {word_count} words.
Then, you will review the student's original writing essay:{content}
After that, you will output a polished version based on the student's writing purpose.
You should consider the Student's level :{level}, and only use the vocabulary at his level. Try to understand what he wants to express, and DO NOT change his original meaning while you should only focus on improving his English language skill. 


##FORMAT## 
ONLY OUTPUT THE RESULT, don't say anything else.

##Examplar##
If the student's original writing essay is :
The Earth is a beautiful place, Earth is the only home to live for us. We should take good care of animals and animals are our best friend. We should plant more trees because trees can help us a lot. We should save.We close the lamp whe we leave the classroom. We shold save food.

Your polished version should be:
The Earth is a beautiful place. It is our only home. We should take good care of animals because they are our best friends. We should plant more trees because they help us a lot. We should save energy by turning off the lights when we leave the classroom. We should also save food.

    `
    const parser = new StringOutputParser()
    const chain = RunnableSequence.from([
        PromptTemplate.fromTemplate(
            template
        ),
        new ChatOpenAI({ model: 'gpt-4o' }),
        parser
    ]);
    const maxRetries = 5
    let attempts = 0;
    while (attempts < maxRetries) {
        try {
            const res = await chain.invoke({
               task: task,
                content: content,
                level: level,
                word_count:word_count
            })
            return res
        }
        catch (error) {
            attempts++;
            console.error(`Attempt ${attempts} failed:`, error);

            if (attempts >= maxRetries) {
                throw new Error('Maximum retries reached');
            }
        }
    }
}



export async function genTalkaboutFeedback(
    content: string,
    task: string,
    level: string,
    word_count: string,
    image_url:string

) {
    const template = `
#Overall Rules to follow 
You are an English teacher reviewing students' English oral homework. You should score homework from different aspects and give academic language learning feedback to help them improve their English skills. 


##Requirement##
The task/topic/question of this oral homework is:{task}
The student's writing homework is:{content}
The student's English Level is:{level}
Please always consider the homework requirement and student level while grading and giving feedback.

# You should score the homework according to the following standards:
- "Vocabulary_Score": 
Score 100-90(Section A): Rich and varied vocabulary; Appropriate and accurate word choice; Effective use of advanced and idiomatic expressions
Score 89-80(Section B):Good range of vocabulary; Mostly accurate word choice; Some use of advanced expressions
Score 79-70(Section C):Adequate range of vocabulary,Some inaccurate word choices,Limited use of advanced expressions
Score 69-60(Section D):Limited range of vocabulary;Frequent inaccurate word choices;Little to no use of advanced expressions
Score 59-0(Section F):Very limited vocabulary;Persistent inaccurate word choices;No use of advanced expressions

- "Theme_Relevance_Score":
Score 100-90(Section A): Fully addresses the topic; Insightful and well-developed ideas; Clear and coherent focus throughout; answered more than {word_count} words.
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



# “feedback”: Your academic language learning feedback should at least includes 3 parts
-  What did the student do well? What should the student improve?
- Judge the overall content relevance and story telling skill of the homework
- Mention if there is any obvious vocabulary or grammar mistakes, mention the most serious ones. And give the correction of it.
# Your feedback MUST be less than 80 words.
#You should give appropriate feedback according to  user's CEFR English level. Remember this is an oral English homework. You should judge it with Oral English standard instead of a writing standard.
#You should both praise and criticize, use a kind teacher tone in Chinese. You MUST only respond with the feedback itself! You MUST respond with <Chinese>! 你必须使用中文回复！

#Output Format:
{format_instructions}

    `
    const parser = StructuredOutputParser.fromZodSchema(
        z.object({
            Vocabulary_Score: z.number().describe("Score number of the vocabulary accuracy,0-100"),
            Theme_Relevance_Score: z.number().describe("Score number of the theme relevance,0-100"),
            Grammar_Syntax_Score: z.number().describe("Score number of Grammatical accuracy,0-100"),
            feedback:z.string().describe("Generally respond to students' work and help them to do better, which length is about 50 words, using Chinese to write feedback and some English when necessary. REMEMBER you are a warm teacher who is writing to a 10-year-old child, so please USE a Friendly, Supportive and Encouraging TONE.")
        })
    );
    const chain = RunnableSequence.from([
        PromptTemplate.fromTemplate(
            template
        ),
        new ChatOpenAI({ model: 'gpt-4o' }),
        parser,
    ]);
    const maxRetries = 5
    let attempts = 0;
    while (attempts < maxRetries) {
        try {
            const res = await chain.invoke({
                task: task,
                content: content,
                level: level,
                word_count:word_count,
                format_instructions: parser.getFormatInstructions()
            })
            return {
                ...res,
                score: 0.6*res.Theme_Relevance_Score +0.2*res.Grammar_Syntax_Score+0.2*res.Vocabulary_Score
            }
        }
        catch (error) {
            attempts++;
            console.error(`Attempt ${attempts} failed:`, error);

            if (attempts >= maxRetries) {
                throw new Error('Maximum retries reached');
            }
        }
    }
}