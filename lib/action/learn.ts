'use server'
import { kv } from "@vercel/kv"

export async function getCurrentLesson(){
    const result = await kv.hgetall('current@' + 'hailing')
    return JSON.parse(JSON.stringify(result))
}