"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createTalkabout, updateScenario } from "@/lib/action/mongoIO"
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

const prepareTime = [
  10,
  20,
  30,
  45,
  60,
  90,
  120,
  180
]


const answerTime = [
  10,
  20,
  30,
  45,
  60,
  90,
  120,
  180
]

const formSchema = z.object({
  name: z.string().min(1, {
    message: "名称不可为空",
  }),
  intro: z.string().min(1, {
    message: "简介不可为空",
  }),
  rule: z.string().min(1, {
    message: "题目不可为空",
  }),
  instruction: z.string().min(1, {
    message: "思路提示不可为空",
  }),
  image_description: z.string(),
  examplar:z.string(),
  prepare_time: z.string().min(1, {
    message: "准备时间不可为空",
  }),
  answer_time: z.string().min(1, {
    message: "作答时间不可为空",
  }),
  level: z.string().min(1, {
    message: "难度设定不能为空",
  }),
  access: z.string()
})

const defaultFlow = `第1-5轮：介绍自己并询问学习者的姓名，同时保持角色设定以建立场景。
第6-10轮：逐渐介绍目标单词，一个接一个地进行。
第11-15轮：开始讨论基于目标单词和目标句子的特定话题。
第16-20轮：如果学习者已经掌握了最初的目标，开始教授额外的句子结构。
第21-23轮：根据讨论的话题谈一些有趣的事情。
第24-25轮：总结所学内容并道别，结束对话。`

export function ScenarioForm({ userId, allCharacters }: { userId: string, allCharacters: any[] }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      answer_time: '60',
      prepare_time: '30',
      level: 'CEFR A1',
      access: 'public'
    },
  })
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [lessonId, setLessonId] = useState('')
  const imgFileRef = useRef<HTMLInputElement>(null);
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true)
    if (!imgFileRef.current?.files) {
      throw new Error("No Background selected");
    }
    const image = imgFileRef.current.files[0];
    const res = await fetch(
      `/api/character/upload?filename=talkabout/${image.name}`,
      {
        method: 'POST',
        body: image,
      },
    );
    const newImage = (await res.json()) as PutBlobResult;

    const content = { image_url: newImage.url, ...values }
    console.log('submitting')
    console.log(values)
    const id = await createTalkabout(userId, content)
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
          <Button onClick={() => router.push('/')}>
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
          <FormField
            control={form.control}
            name="intro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>简介</FormLabel>
                <FormControl>
                  <Input placeholder="请输入简介..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="">

          <FormField
            control={form.control}
            name="rule"
            render={({ field }) => (
              <FormItem>
                <FormLabel>题目</FormLabel>
                <FormControl>
                  < Textarea className="h-24" placeholder="请输入题目.." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="">
          <FormField
            control={form.control}
            name="instruction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>思路提示</FormLabel>
                <FormControl>
                  < Textarea className="h-24" placeholder="请输入思路提示.." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="">
          <FormField
            control={form.control}
            name="image_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>图片描述</FormLabel>
                <FormControl>
                  < Textarea className="h-24" placeholder="请输入图片描述.." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="">
          <FormField
            control={form.control}
            name="examplar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>范文</FormLabel>
                <FormControl>
                  < Textarea className="h-24" placeholder="请输入范文.." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-6">

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

          <FormItem>
            <FormLabel>图片</FormLabel>
            <FormControl>
              <Input id="picture" ref={imgFileRef} type="file" />
            </FormControl>

            <FormMessage />
          </FormItem>

          <FormField
            control={form.control}
            name="prepare_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>准备时间（秒）</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {prepareTime.map((item, index) => (
                        <SelectItem key={index} value={item.toString()}>
                          <div className="flex flex-row gap-2">
                            {item.toString()}
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
            name="answer_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>作答时间（秒）</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {answerTime.map((item, index) => (
                        <SelectItem key={index} value={item.toString()}>
                          <div className="flex flex-row gap-2">
                            {item.toString()}
                          </div></SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
