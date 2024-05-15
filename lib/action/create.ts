'use server'
import { kv } from "@vercel/kv"
import { Character, ClassPrompt, LearnerProfile, Scenario } from "../schema/chat"
import { auth, currentUser } from "@clerk/nextjs/server";
import { nanoid } from "ai";


export async function createProfile(profile: LearnerProfile) {
    const { userId } = auth();
    await kv.hset('learnerProfile@' + userId,  {profile}) //metadata 存储
    console.log('Create Profile@' + userId, ':', profile)
}

export async function createCharacter(character: Character) {
    const { userId } = auth();
    const characterId = nanoid(16)
    await kv.hset('character@' + characterId,  {creator:userId,...character}) //metadata 存储
    await kv.sadd('characterList@' + userId,characterId) //用户表存储
    await kv.sadd('characterList@all',characterId) //全局存储
    console.log('Create Character@' + character.name, ':', character)
    return characterId
}

export async function createScenario(scenario: Scenario) {
    const { userId } = auth();
    const scenarioId = nanoid(16)
    await kv.hset('scenario@' + scenarioId, { creator: userId, ...scenario }) //metadata 存储
    await kv.sadd('scenarioList@' + userId, scenarioId) //用户表存储
    await kv.sadd('scenarioList@all', scenarioId) //全局存储
    console.log('Create Scenario@' + scenario.name, ':', scenario)
    return scenarioId
}

export async function createClassPrompt(classSetting: ClassPrompt) {
    const { userId } = auth();
    const classId = nanoid(16)
    await kv.hset('classPrompt@' + classId, { creator: userId, ...classSetting }) //存储 prompt metadata
    await kv.sadd('classPromptList@' + userId, classId) // 用户表存储 promptList
    await kv.sadd('classPromptList@all', classId) // 全局表存储 promptList
    console.log('Create Class@' + classId, ':', classSetting.name)
}

