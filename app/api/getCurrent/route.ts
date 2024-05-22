
import { kv } from '@vercel/kv';
import { NextRequest,NextResponse } from "next/server";
import { unstable_noStore as noStore } from 'next/cache';

export async function GET() {
    // const data = await req.json()
    noStore()
    const result = await kv.hgetall('current@' + 'hailing') as any

    return NextResponse.json({id:result.id,type:result.type})
}