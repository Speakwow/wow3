"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { updatePrompt } from "@/lib/action/update"
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

const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "prompt cannot be empty.",
  }),
})
 
export function PromptForm({ params }: { params: { prompt: string } }) {

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        prompt: "",
      },
    })
   
    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
      
        updatePrompt(params.prompt,values.prompt)
      // Do something with the form values.
      // ✅ This will be type-safe and validated.
      setTimeout(() => {
        window.location.reload();
      }, 1000); // 1000 毫秒 = 1 秒
      console.log(values)
    }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Prompt</FormLabel>
              <FormControl>
                <Textarea className="h-[200px]" placeholder="Input your prompt" {...field} />
              </FormControl>
              <FormDescription>
                Changes will take effect immediately
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}