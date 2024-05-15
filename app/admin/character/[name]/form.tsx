"use client"


import type { PutBlobResult } from '@vercel/blob';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { deleteCharacter, updateScenario } from "@/lib/action/update"
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
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { kv } from '@vercel/kv';
import { redirect } from 'next/navigation';


const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name cannot be empty.",
  }),
  avatar: z.instanceof(File)
    .refine((file) => file.size < 2 * 1024 * 1024, 
    'File size must be less than 2MB'),
  background: z.instanceof(File),
  voice: z.string().min(1, {
    message: "Must have a voice",
  }),
  persona: z.string().min(1, {
    message: "Must have a persona.",
  })
})

export function DeleteButton({id}:{id:string}){
    return(
        <Button variant='destructive' onClick={()=>deleteCharacter(id)}>
            Delete
        </Button>
    )
}

export function CharacterForm(params: { prompt: string }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })
  function onSubmit(values: z.infer<typeof formSchema>) {
    updateScenario(params.prompt, values)
    console.log(values)
    fetch(
      `/api/character/upload?filename=${values.avatar.name}`,
      {
        method: 'POST',
        body: values.avatar,
      },
    );

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
                <FormLabel>Edit Prompt</FormLabel>
                <FormControl>
                  <Textarea className="h-[180px]" placeholder="Input Your Prompt" {...field} />
                </FormControl>
                <FormDescription>
                  Name of the character
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="persona"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Edit Persona</FormLabel>
                <FormControl>
                  <Textarea className="h-[180px]" placeholder="Input Your Prompt" {...field} />
                </FormControl>
                <FormDescription>
                  Description of the character
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar</FormLabel>
                <FormControl>
                  <Input id="picture" type="file" />
                </FormControl>
                <FormDescription>
                  Avatar of the character
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="background"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background</FormLabel>
                <FormControl>
                  <Input id="picture" type="file" required />
                </FormControl>
                <FormDescription>
                  Background Image of the character
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="voice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Edit Voice</FormLabel>
                <FormControl>
                  <Textarea className="h-[180px]" placeholder="Input Your Prompt" {...field} />
                </FormControl>
                <FormDescription>
                  Voice of the character
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}