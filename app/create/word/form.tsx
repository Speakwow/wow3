"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createRepeat, createTalkabout, updateScenario } from "@/lib/action/mongoIO"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { createScenario } from "@/lib/action/mongoIO"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRef } from "react"
import { PutBlobResult } from "@vercel/blob"


const formSchema = z.object({
  name: z.string().min(1, {
    message: "名称不可为空",
  }),
  text: z.string().min(1, {
    message: "内容不可为空",
  }),
  access: z.string()
})


export function RepeatForm({ userId }: { userId: string }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      access: 'public'
    },
  })
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [lessonId, setLessonId] = useState('')

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true)
    console.log('submitting')
    console.log(values)
    const id = await createRepeat(userId,values.name,values.text.split('\n'),values.access)
    console.log('submit success')
    setIsSaving(false)
    setIsSaved(true)
    setLessonId(id)
    //router.push('/scenario/' + id)
  }
  if (isSaved) {
    return (
      <div>
        <div className="text-center py-24 text-3xl text-primary font-black">
          🎉 创建成功！
        </div>
        <div className="flex flow-row justify-center gap-4">
          <Button variant="outline" onClick={() => router.push('/')}>
            返回首页
          </Button>
          <Button onClick={() => router.push(`/repeat/${lessonId}`)}>
            立即查看
          </Button>
        </div>
      </div>
    )
  } else if (isSaving) {
    return (
      <div className="text-center py-24 text-xl text-primary font-black">
        <div className="animate-pulse">
          正在创建中...
        </div>
        <div>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-6">
          {/* <div className="flex justify-end">
            <Button type="button" className="w-fit" >一键生成</Button>
          </div> */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>名称</FormLabel>
                <FormControl>
                  <Input placeholder="请输入名称..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="">

          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>跟读内容</FormLabel>
                <FormControl>
                  < Textarea className="h-24" placeholder="请输入内容，多条内容分行.." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
          
          <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-6">
            <FormField
              control={form.control}
              name="access"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>权限</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="public" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          公开
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="private" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          私有
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>


          <Button type="submit">提交</Button>
      </form>
    </Form>
  )
}
