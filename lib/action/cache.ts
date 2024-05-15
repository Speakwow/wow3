// 'use server'
// import { kv } from "@vercel/kv"
// import { Character, ClassSetting, Scenario } from "../schema/chat"
// import { EvalResult } from "../speech/eval"

// export async function cachePronResult(id:number,result:EvalResult) {
//     await kv.zadd('scenario@'+id,{ score: result.length, member: result.pronunciation })
//     console.log('Create Scenario@'+scenario.name,':',scenario)
// }