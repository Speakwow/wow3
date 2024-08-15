'use client'
import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { useRouter } from "next/navigation";
import { Score2Grade, adjustScore } from "@/lib/tools";


export function RepeatReport({ score, length, duration }: { score: number, length: number, duration: number }) {
  const router =useRouter()
  return (
    <Card className="p-4">
      <CardHeader className="flex justify-center items-center">
        <div className='text-center text-xl'>
          You did it！本次得分：
        </div>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col'>
          <div className='text-center text-[#42C83C] text-6xl font-bold'>
            {Score2Grade(score)}
          </div>
        </div>
        <div className='grid grid-cols-2 text-center gap-4 py-6'>
          <div className='flex flex-col'>
            <div>
              练习数
            </div>
            <div className=' text-[#FF8B01] text-5xl font-bold'>
              {length}
            </div>
          </div>
          <div className='flex flex-col'>
            <div>
              练习时长
            </div>
            <div className='text-[#019FFF] text-5xl font-bold'>
              {duration.toFixed(1)} <span className="text-xl">分钟</span>
            </div>
          </div>
          {/* <div className='flex flex-col'>
          <div>
            Round
          </div>
          <div className='text-[#3DB94A] text-5xl'>
            {messages.length}<p className='inline text-sm'></p>
          </div>
        </div>
        <div className='flex flex-col'>
          <div>
            Time
          </div>
          <div className='text-[#FF3C21] text-5xl'>
            <p className='inline'>&nbsp;&nbsp;</p>{Math.round((stayTime/60000))}<p className='inline text-sm'>min</p>
          </div>
        </div> */}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t py-4">
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


export function LessonReport({ score, detail }: { score: number, detail: any }) {
  const router =useRouter()
  return (
    <Card className="p-4">
      <CardHeader className="flex justify-center items-center">
        <div className='flex justify-center'>
          <img src='/report-bravo.gif' className='w-1/5'></img>
        </div>
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

          {/* <div className='flex flex-col'>
        <div>
          Round
        </div>
        <div className='text-[#3DB94A] text-5xl'>
          {messages.length}<p className='inline text-sm'></p>
        </div>
      </div>
      <div className='flex flex-col'>
        <div>
          Time
        </div>
        <div className='text-[#FF3C21] text-5xl'>
          <p className='inline'>&nbsp;&nbsp;</p>{Math.round((stayTime/60000))}<p className='inline text-sm'>min</p>
        </div>
      </div> */}
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