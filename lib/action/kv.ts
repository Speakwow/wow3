'use server'

import { kv } from "@vercel/kv"


export async function getPoint(userId:string) {
    const point = await kv.hget(userId,'point')
    if(!point){
        await kv.hset(userId,{point:1000})
        return 1000
    }
    return point as number
}


export async function costPoint(userId:string,cost:number) {
    const point = await getPoint(userId)
    if(point < cost){
        return {status:"insufficient",message:"余额不足",pointLeft:point}
    }
    const pointleft = point - cost
    try{
    await kv.hset(userId,{point:pointleft})
    }catch(error){
        return {stauts:'failed',message:"扣费失败",pointLeft:point}
    }
    return {status:"ok",message:"扣费成功",pointLeft:pointleft}
}