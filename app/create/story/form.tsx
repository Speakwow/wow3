"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { updateScenario } from "@/lib/action/mongoIO"
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

const rounds = [
  15,
  20,
  25,
  30,
  35,
  40,
  45,
  50
]

const formSchema = z.object({
  topic: z.string().min(4, {
    message: "至少输入 4 个字符",
  }),
  goal: z.string().min(4, {
    message: "至少输入 4 个字符",
  }),
  name: z.string().min(1, {
    message: "情景名称不可为空",
  }),
  character: z.string().min(1, {
    message: "Must have a character",
  }),
  setup: z.string().min(1, {
    message: "场景设定不能为空",
  }),
  length: z.string(),
  ai_role: z.string(),
  level: z.string().min(1, {
    message: "难度设定不能为空",
  }),
  target_words: z.string(),
  target_sentences: z.string(),
  intro: z.string(),
  welcomeMessage: z.string().min(1, {
    message: "Welcome Message cannot be empty.",
  },),
  flow: z.string(),
  access: z.string()
})

const defaultFlow = `
Rounds 1-2: Introduce the background of the story, for example: where does the story happen,always provide two choices for the learner.,
Rounds 3-4: Gradually transition to create a main-character with the learner, ask them to design the main-character's appearance and specialty, remember to use open questions or multiple choices.,
Rounds 5-10: Continue expanding the story, create 3 key scenarios and let the learner choose what will happen next, let the learner guess what the main-character will choose in those scenarios. You can add on them to  make the story complete and interesting,
Rounds 11-13: Engage in discussions and ask the learner’s opinions on some questions related to the story and learning topic.,
Rounds 14-15: Create a Happy Ending or a meaningful ending for the Stor. Saying WOW, It was a nice story. You are a great story-teller!`

export function ScenarioForm({ userId, allCharacters }: { userId: string, allCharacters: any[] }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      character: "6650346b4b838ac30d19694c",
      intro: '',
      setup: '/',
      length: '15',
      ai_role: '/',
      level: 'CEFR A1',
      goal: `#RULES: Create a story with a 10-year-old children. You should always PROVIDE CHOICES for the learner, and encourage them to decided how the story goes. The story should only use A2 English Level's vocabulary and grammar. REMEMBER you are talking to 10-year-old children, the story should be easily understood for a 10-year-old child. Create interesting and exciting plots for children. `,
      target_words: '/',
      target_sentences: '/',
      welcomeMessage: 'Hello, ready for the adventure? ',
      flow: defaultFlow,
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
    const id = await createScenario(userId, values)
    console.log('submit success')
    setIsSaving(false)
    setIsSaved(true)
    setLessonId(id)
    // router.push('/scenario/' + id)
  }
  const [isGenerating, setIsGenerating] = useState(false)
  async function genData(values: z.infer<typeof formSchema>) {
    setIsGenerating(true)
    await Promise.all([
      // genScenarioTarget(values.topic, values.goal, values.level).then(res => {
      //   if(res){
      //   form.setValue("target_words", res.target_words.join('\n'))
      //   form.setValue("target_sentences", res.target_sentences.join('\n'))
      //   }
      // }
      // ),
      genScenarioBasic(values.topic, values.goal).then(res => {
        if(res){
        form.setValue("name", res.name)
        form.setValue("intro", res.intro)
        form.setValue("setup", res.setting)
        form.setValue("welcomeMessage", res.welcomeMessage)
        const selectedCharacter = allCharacters.find(character => character._id === values.character);
        
        }
      }).finally(() => setIsGenerating(false))
    ]);
  }

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
          <Button onClick={() => router.push(`/scenario/${lessonId}`)}>
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
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="">👋 想要创造怎样的故事？</FormLabel>
                  <FormControl>
                    <Textarea className="h-24 border-primary " placeholder="请描述你期望进行的故事..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-2 sr-only">
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="">📚 想要完成怎样的学习目标？</FormLabel>
                  <FormControl>
                    <Textarea className="h-24 border-primary " placeholder="请描述你希望 AI 助教需要帮助你完成什么学习目标？教授一些新的单词，还是练习日常对话？..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-2  text-xl font-bold">
            基础设置
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
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
            </div>
            <FormField
              control={form.control}
              name="length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>轮次</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rounds.map((item, index) => (
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
        </div>
        <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="character"
            render={({ field }) => (
              <FormItem>
                <FormLabel>对话角色</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择你的互动角色" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {allCharacters.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        <div className="flex flex-row gap-2">
                          <Avatar className="w-[20px] h-[20px]">
                            <AvatarImage src={item.avatar} />
                          </Avatar>
                          <div>
                            {item.name}
                          </div>
                        </div></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* <FormDescription>
                  查看并管理你的{" "}
                  <Link href="/admin/character" className="text-[#42C83C]">互动角色</Link>.
                </FormDescription> */}
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
        <Separator />
        <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-6">
          <div className="text-xl font-bold">
            详细设定
          </div>

          <div className="flex justify-end">
            <Button type="button" className="w-fit" onClick={() => genData(form.getValues())} disabled={isGenerating} >一键生成</Button>
          </div>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>课程名称</FormLabel>
                <FormControl>
                  <Input placeholder="请输入情景名称..." {...field} />
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
                <FormLabel>课程简介</FormLabel>
                <FormControl>
                  <Input placeholder="请输入情景简介..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="sr-only">
          <FormField
            control={form.control}
            name="setup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>场景设定</FormLabel>
                <FormControl>
                  <Textarea className="h-24" placeholder="请描述对话发生的场景..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ai_role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>角色设定</FormLabel>
                <FormControl>
                  <Textarea className="h-24" placeholder="请输入AI需要扮演的角色..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
          <div className="sr-only">
          <FormField
            control={form.control}
            name="target_words"
            render={({ field }) => (
              <FormItem>
                <FormLabel>目标词汇</FormLabel>
                <FormControl>
                  <Textarea className="h-48" placeholder="请输入希望练习的词汇，使用逗号“,”分隔..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="target_sentences"
            render={({ field }) => (
              <FormItem>
                <FormLabel>目标句型</FormLabel>
                <FormControl>
                  <Textarea className="h-48" placeholder="请输入希望练习的句型，使用斜杠“/”分隔..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
          <div className="sr-only">
          <FormField
            control={form.control}
            name="welcomeMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>欢迎语</FormLabel>
                <FormControl>
                  <Textarea className='h-24' placeholder="请输入欢迎语，如：Hello, how are you doing today?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="flow"
            render={({ field }) => (
              <FormItem>
                <FormLabel>对话流程</FormLabel>
                <FormControl>
                  <Textarea className='h-48' placeholder={`请输入...`} {...field} />
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
