"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createWrite, updateScenario } from "@/lib/action/mongoIO"
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
import { genScenarioBasic, genScenarioFlow, genScenarioTarget } from "@/lib/action/gen"


const levels = [
  {
    label: 'pre-A1:零基础',
    value: 'CEFR pre-A1'
  },
  {
    label: 'A1:简单短句交流',
    value: 'CEFR A1'
  },
  {
    label: 'A2:简单日常对话',
    value: 'CEFR A2'
  },
  {
    label: 'B1:独立旅行交流',
    value: 'CEFR B1'
  },
  {
    label: 'B2:清晰表达观点',
    value: 'CEFR B2'
  },
  {
    label: 'C1:讨论复杂话题',
    value: 'CEFR C1'
  },
  {
    label: 'C2:接近母语水平',
    value: 'CEFR C2'
  }
]


const formSchema = z.object({
  name: z.string().min(1, {
    message: "不可为空",
  }),
  topic: z.string().min(6, {
    message: "至少输入 6 个字符",
  }),
  word_count:  z.string().min(1, {
    message: "字数设定不能为空",
  }),
  level: z.string().min(1, {
    message: "难度设定不能为空",
  }),
  first_line:z.string(),
  access: z.string()
})

const defaultRule = `
1. 内容相关 巴啦啦啦啦

`

export function WriteForm({ userId }: { userId: string }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      word_count: "70",
      level: 'CEFR A1',
      access: "public"
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
    const id = await createWrite(userId, values)
    console.log('submit success')
    setIsSaving(false)
    setIsSaved(true)
    setLessonId(id)
    // router.push('/scenario/' + id)
  }
  const [isGenerating, setIsGenerating] = useState(false)

  if (isSaved && lessonId) {
    return (
      <div>
        <div className="text-center py-24 text-3xl text-primary font-black">
          🎉 创建成功！
        </div>
        <div className="flex flow-row justify-center gap-4">
          <Button variant="outline" onClick={() => router.push('/')}>
            返回首页
          </Button>
          <Button onClick={() => router.push(`/write/${lessonId}`)}>
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
        <div className="flex flex-col  gap-4">
          <div className=" ">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="">作文标题</FormLabel>
                  <FormControl>
                    < Input placeholder="作文题目如save the earth" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className=""> 写作任务</FormLabel>
                  <FormControl>
                    <Textarea className="h-32  " placeholder="本次写作任务" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className=" ">
            <FormField
              control={form.control}
              name="first_line"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="">开头</FormLabel>
                  <FormControl>
                    < Input placeholder="为学生练习创建一个预设的开头，可为空" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>


            <div className="grid gap-4 xs:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>难度</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {levels.map((item, index) => (
                        <SelectItem key={index} value={item.value}>
                          <div className="flex flex-row gap-2">
                            <Badge className="">
                              {item.label}
                            </Badge>
                          </div></SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="word_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="">字数要求</FormLabel>
                <FormControl>
                  <Input  {...field} type="number"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    className="flex flex-row space-x-2"
                  >
                    <FormItem className="flex items-center space-x-3  py- space-y-0">
                      <FormControl>
                        <RadioGroupItem value="public" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        所有人可见
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="private" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        仅自己与受邀者
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
        </div>




        <Button type="submit">提交</Button>
      </form>
    </Form>
  )
}
