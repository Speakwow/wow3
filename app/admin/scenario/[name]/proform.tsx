"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { deleteScenario, updateScenario } from "@/lib/action/update"
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
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarImage } from "@radix-ui/react-avatar"

// const formSchema = z.object({
//   prompt: z.string().min(1, {
//     message: "Prompt cannot be empty.",
//   }),
//   welcomeMessage:z.string().min(1, {
//     message: "Welcome Message cannot be empty.",
//   })
// })

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name cannot be empty.",
  }),
  character: z.string().min(1, {
    message: "Must have a character",
  }),
  level:z.string().min(1, {
    message: "Must have a level",
  }),
  targetWords: z.string().min(1, {
    message: "target Words cannot be empty.",
  }),
  targetPhrases: z.string().min(1, {
    message: "target Phrases cannot be empty.",
  }),
  targetSentences: z.string().min(1, {
    message: "target Sentences cannot be empty.",
  }),
  keyPoints: z.string().min(1, {
    message: "keyPoints cannot be empty.",
  }),
  length: z.number(),
  flow: z.string().min(1, {
    message: "flow cannot be empty.",
  }),
  welcomeMessage: z.string().min(1, {
    message: "Welcome Message cannot be empty.",
  })
})

const levels =[
  'A1 elementary',
  'A2 pre-intermediate',
  'B1 intermediate',
  'B2 junior',
  'C1 junior',
  'C2 junior',
]

export function ScenarioForm({ id, allCharacters }: { id: string, allCharacters: any[] }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      character: "",
      level:"",
      targetWords: "",
      targetPhrases: "",
      flow: "",
      welcomeMessage: ""
    },
  })
  function onSubmit(values: z.infer<typeof formSchema>) {
    updateScenario(id, values)
    setTimeout(() => {
      window.location.reload();
    }, 1000); // 1000 毫秒 = 1 秒
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 h-1/2">
        <div className="flex flex-col gap-4">

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>场景名</FormLabel>
                <FormControl>
                  <div className="flex justify-between gap-4">
                    <Input placeholder="Input Scenario Name" {...field} />
                    <Button onClick={() => deleteScenario(id)} variant='destructive'>删除场景</Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="character"
            render={({ field }) => (
              <FormItem>
                <FormLabel> CHARACTER</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择你的互动角色" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {allCharacters.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        <div className="flex flex-row gap-2">
                          <Avatar className="w-[20px]">
                            <AvatarImage src={item.avatar} />
                          </Avatar>
                          <div>
                            {item.name}
                          </div>
                        </div></SelectItem>
                    ))}

                  </SelectContent>
                </Select>
                <FormDescription>
                  查看并管理你的{" "}
                  <Link href="/admin/character" className="text-[#42C83C]">互动角色</Link>.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>教学难度</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择难度" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {allCharacters.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        <div className="flex flex-row gap-2">
                          <Avatar className="w-[20px]">
                            <AvatarImage src={item.avatar} />
                          </Avatar>
                          <div>
                            {item.name}
                          </div>
                        </div></SelectItem>
                    ))}

                  </SelectContent>
                </Select>
                <FormDescription>
                  查看并管理你的{" "}
                  <Link href="/admin/character" className="text-[#42C83C]">互动角色</Link>.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="targetWords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>目标词汇</FormLabel>
                <FormControl>
                  <Textarea className="h-[300px]" placeholder="compelete,typical,..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="targetPhrases"
            render={({ field }) => (
              <FormItem>
                <FormLabel>目标短语</FormLabel>
                <FormControl>
                  <Textarea className="h-[300px]" placeholder="learn exam skills, cut out,..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="targetSentences"
            render={({ field }) => (
              <FormItem>
                <FormLabel>目标句型</FormLabel>
                <FormControl>
                  <Textarea className="h-[300px]" placeholder="I think you should..., It's important to..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="keyPoints"
            render={({ field }) => (
              <FormItem>
                <FormLabel>教学重难点</FormLabel>
                <FormControl>
                  <Textarea className="h-[300px]" placeholder="使用目标语句表达自己的观点与对别人的建议" {...field} />
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
                <FormLabel>教学流程</FormLabel>
                <FormControl>
                  <Textarea className="h-[300px]" placeholder="
                  - Rounds 1-5: Introduce yourself and ask about the learner's name, while staying in character as Marina the Mermaid to establish the underwater scenario. 
                  - Rounds 6-9: Gradually transition to introducing musical instrument names one by one. 
                  - Rounds 10-14: Move on to discuss specific topics based on Target vocabulary and Target sentence. 
                  - Rounds 15-19: Move on to ask learner's hobby and talk about it further. 
                  - Rounds 20-22: If the learner has already mastered the initial targets, begin teaching additional sentence structures. 
                  - Rounds 23-24: Talk about something fun based on the topics discussed. 
                  - Round 25: Conclude the conversation by summarizing what was learned and saying goodbye." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="welcomeMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Edit Welcome Message</FormLabel>
                <FormControl>
                  <Textarea className="h-1/4" placeholder="Input Welcome Message" {...field} />
                </FormControl>
                <FormDescription>
                  The first message from AI.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit" className="w-full py-4">提交修改</Button>
        </div>
      </form>
    </Form>
  )
}