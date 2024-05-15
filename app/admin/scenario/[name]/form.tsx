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
  prompt: z.string().min(1, {
    message: "Prompt cannot be empty.",
  }),
  welcomeMessage: z.string().min(1, {
    message: "Welcome Message cannot be empty.",
  })
})

export function ScenarioForm({ id, allCharacters }: { id: string, allCharacters: any[] }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      character: "",
      prompt: "",
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
                  <Button onClick={()=>deleteScenario(id)} variant='destructive'>删除场景</Button>
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
                          <AvatarImage src={item.avatar}/>
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
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PROMPT</FormLabel>
                <FormControl>
                  <Textarea className="h-[300px]" placeholder="Input Your Prompt" {...field} />
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