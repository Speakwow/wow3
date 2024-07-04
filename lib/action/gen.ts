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
import { StructuredOutputParser,CustomListOutputParser } from "langchain/output_parsers";


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
    const parser = new CustomListOutputParser({length:5,separator:"\n"})
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