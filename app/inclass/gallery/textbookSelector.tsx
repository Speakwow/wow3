'use client'

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { setCurrentTextbook } from "@/lib/action/kv"
import { useRouter } from "next/navigation"

export default function TextbookSelector({ textbooks,userId,currentBookId}: { textbooks: any[],userId:string ,currentBookId:string}) {

    const textbookIds = textbooks.map((textbook: any) => { return textbook._id as string })
    if (textbookIds.length === 0) {
        return (
            <div>
                暂无可选教材
            </div>
        )
    }
    const FormSchema = z.object({
        bookId: z.enum(textbookIds as [string, ...string[]], {
            required_error: "未选择教材",
        }),
    });
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues:{
            bookId:currentBookId
        }
    })
    const router = useRouter()

    function onSubmit(data: z.infer<typeof FormSchema>) {
        setCurrentTextbook(userId,data.bookId).then(()=>{
            toast({
                title: "保存成功",
            })
            router.push('/inclass')
        }
        )

    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
                <FormField
                    control={form.control}
                    name="bookId"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 space-y-1"
                                >
                                    {textbooks.map(textbook => {
                                        return (
                                            <FormItem className="w-full relative">
                                                <FormControl>
                                                    <RadioGroupItem className="absolute top-2 right-2 z-10" value={textbook._id} />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                <Card className="w-full relative">
                                                    <CardHeader>
                                                        <CardTitle>
                                                            测试版：{textbook.name}
                                                        </CardTitle>
                                                        <CardDescription>
                                                            {textbook.level}
                                                        </CardDescription>
                                                    </CardHeader>
                                                </Card>
                                                </FormLabel>
                                            </FormItem>
                                        )
                                    })}

                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">确认</Button>
            </form>
        </Form>
    )
}