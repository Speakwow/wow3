"use client"


import type { PutBlobResult } from '@vercel/blob';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { createCharacter } from '@/lib/action/create';
import { redirect } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name cannot be empty.",
  }),
  voice: z.string().min(1, {
    message: "Must have a voice",
  }),
  persona: z.string().min(1, {
    message: "Must have a persona.",
  })
})

export default function CharacterForm() {
  const route = useRouter()
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const backgroundFileRef = useRef<HTMLInputElement>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    //Upload Avatar
    if (!avatarFileRef.current?.files) {
      throw new Error("No Background selected");
    }
    const avatar = avatarFileRef.current.files[0];
    console.log(avatar)
    const avatarRes = await fetch(
      `/api/character/upload?filename=avatar/${avatar.name}`,
      {
        method: 'POST',
        body: avatar,
      },
    );
    const newAvatar = (await avatarRes.json()) as PutBlobResult;
    // Upload Bg
    if (!backgroundFileRef.current?.files) {
      throw new Error("No Background selected");
    }
    const background = backgroundFileRef.current.files[0];
    const backgroundRes =await fetch(
      `/api/character/upload?filename=background/${background.name}`,
      {
        method: 'POST',
        body: background,
      },
    );
    const newBackground = (await backgroundRes.json()) as PutBlobResult;
    const id = await createCharacter({
      name:values.name,
      avatar:newAvatar.url,
      background:newBackground.url,
      voice:values.voice,
      persona:values.persona
    })
    route.push('./'+id)
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
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Name of the character" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="persona"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Persona</FormLabel>
                <FormControl>
                  <Textarea className="h-[120px]" placeholder="Description of the character" {...field} />
                </FormControl>
                <FormDescription>
                  Description of the character
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

              <FormItem>
                <FormLabel>Avatar</FormLabel>
                <FormControl>
                  <Input id="picture" ref={avatarFileRef} type="file" />
                </FormControl>
                <FormDescription>
                  Avatar of the character
                </FormDescription>
                <FormMessage />
              </FormItem>
 
        
              <FormItem>
                <FormLabel>Background</FormLabel>
                <FormControl>
                  <Input id="picture" ref={backgroundFileRef} type="file" required />
                </FormControl>
                <FormDescription>
                  Background Image of the character
                </FormDescription>
                <FormMessage />
              </FormItem>

          <FormField
            control={form.control}
            name="voice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voice</FormLabel>
                <FormControl>
                  <Input placeholder="Voice of the character" {...field} />
                </FormControl>
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