'use server'

import { auth } from '@clerk/nextjs/server'
import kv from '@vercel/kv'
import { redirect } from 'next/navigation'

export async function updatePrompt(name:string,content:string) {
    await kv.set('prompt@'+name,content)
    console.log('prompt@'+name,':',content)
}

export async function updateScenario(name:string,content:{}) {
  await kv.hset('scenario@'+name,content)
  console.log('scenario@'+name,':',content)
}

export async function updateCharacter(name:string,content:{}) {
  await kv.hset('character@'+name,content)
  console.log('character@'+name,':',content)
}

export async function deleteCharacter(id:string){
  const { userId } = auth();
  await kv.del(`character@` + id)
  await kv.srem(`characterList@`+userId,id)
  await kv.srem(`characterList@all`,id)
  redirect('./')
}

export async function deleteScenario(id:string){
  const { userId } = auth();
  await kv.del(`scenario@` + id)
  await kv.srem(`scenarioList@`+userId,id)
  await kv.srem(`scenarioList@all`,id)
  redirect('./')
}