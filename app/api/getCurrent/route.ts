
import { kv } from '@vercel/kv';
import { NextRequest,NextResponse } from "next/server";

export async function GET() {
    // const data = await req.json()
    const result = await kv.hgetall('current@' + 'hailing') as any

    return NextResponse.json({id:result.id,type:result.type})
}