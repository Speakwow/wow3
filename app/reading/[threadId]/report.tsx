'use client'
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Score2Grade, adjustScore } from "@/lib/tools";


export function ReadingReport({ score, detail }: { score: number, detail: any }) {
  const router =useRouter()
  return (
    <Card className="p-4">
      <CardHeader className="flex justify-center items-center">
        <div className='text-center text-xl'>
          You did it！本次评级：
        </div>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col'>
          <div className='text-center text-[#42C83C] text-6xl font-bold'>
          {Score2Grade(score)}
          </div>
        </div>
        <div className='grid grid-cols-2 text-center gap-4 py-6'>
          {/* <div className='flex flex-col'>
            <div>
              发音准确度
            </div>
            <div className=' text-[#FF8B01] text-5xl font-bold'>
              {detail.accuracy}
            </div>
          </div>
          <div className='flex flex-col'>
            <div>
              表达流利度
            </div>
            <div className=' text-[#FF8B01] text-5xl font-bold'>
              {detail.fluency}
            </div>
          </div>
          <div className='flex flex-col'>
            <div>
              韵律自然度
            </div>
            <div className=' text-[#FF8B01] text-5xl font-bold'>
              {detail.prosody}
            </div>
          </div> */}

          <div className='flex flex-col'>
        <div>
          完成数
        </div>
        <div className='text-[#3DB94A] text-5xl'>
          {detail.length}<p className='inline text-sm'></p>
        </div>
      </div>
      <div className='flex flex-col'>
        <div>
          共答对
        </div>
        <div className='text-[#3DB94A] text-5xl'>
          {detail.countCorrect}<p className='inline text-sm'></p>
        </div>
      </div>

        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t py-4 flex-fow gap-4">
          <Button onClick={()=>router.push('/')} size="lg" className="py-6 px-10 bg-[#42C83C] text-xl rounded-full">
            完成练习
          </Button>
          <Button onClick={()=>window.location.reload()} size="lg" variant="secondary" className="py-6 px-10 text-xl rounded-full">
            再次挑战
          </Button>
      </CardFooter>
    </Card>
  )
}