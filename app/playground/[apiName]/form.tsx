"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { useState } from "react"

const formSchema = z.object({
  content: z.string().min(1, {
    message: "content cannot be empty.",
  }),
})

export function PromptForm(params: { apiName: string }) {

  const [res, setRes] = useState('');
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  })
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const res = await fetch('/api/'+params.apiName, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: values.content })
    });
    const data = await res.json();
    setRes(data.message)
  }

  return (
    <CardContent className=" grid grid-cols-2 gap-6">
      <div className="h-screen flex flex-col gap-4">
        <Label className="text-primary ">
          Response
        </Label>
        {res&&res.length>0 ?
          <div className="w-full h-1/2 p-2 border-2 border-primary rounded-md radius-2">
            <ScrollArea className="h-full p-2">
              {res}
            </ScrollArea>
          </div>
          :
          <div className="animate-pulse">
            Waiting...
          </div>}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Request</FormLabel>
                <FormControl>
                  <Textarea className="h-[200px]" placeholder="Input your content" {...field} />
                </FormControl>
                <FormDescription>
                  Test Your AI End Point
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Send</Button>
        </form>
      </Form>

    </CardContent>
  )
}