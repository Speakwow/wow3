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

export default function TextbookSelector({ textbooks, userId, currentBookId }: { textbooks: any[], userId: string, currentBookId: string }) {

    const textbookIds = textbooks.map((textbook: any) => { return textbook._id as string })
    const FormSchema = z.object({
        bookId: z.enum(textbookIds as [string, ...string[]], {
            required_error: "未选择教材",
        }),
    });
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            bookId: currentBookId
        }
    })
    const router = useRouter()

    function onSubmit(data: z.infer<typeof FormSchema>) {
        setCurrentTextbook(userId, data.bookId).then((res) => {
            toast({
                title: "保存成功",
            })
            router.push('/inclass/'+data.bookId)
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
                                    className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                >
                                    {textbooks.map(textbook => {
                                        return (
                                            <FormItem className="w-full relative" key={textbook._id}>
                                                <FormControl>
                                                    <RadioGroupItem className="absolute top-2 right-2 z-10" value={textbook._id} />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    <Card className="w-full relative">
                                                        <CardHeader>
                                                            <CardTitle className="text-lg">
                                                               {textbook.name}
                                                            </CardTitle>
                                                            <CardDescription>
                                                            测试版：{textbook.level}
                                                            </CardDescription>
                                                        </CardHeader>
                                                    </Card>
                                                </FormLabel>
                                            </FormItem>
                                        )
                                    })}
                                    <FormItem className="w-full relative">
                                        <FormControl>
                                            {/* <RadioGroupItem className="absolute top-2 right-2 z-10" value={'yilin'} /> */}
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            <Card className="w-full relative text-muted-foreground bg-muted">
                                                <CardHeader>
                                                    <CardTitle className="text-lg">
                                                        人教版
                                                    </CardTitle>
                                                    <CardDescription>
                                                        测试版：暂无权限
                                                    </CardDescription>
                                                </CardHeader>
                                            </Card>
                                        </FormLabel>
                                    </FormItem>

                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex flex-row gap-2">
                    <Button type="submit">确认</Button>
                    <Button type="button" variant="outline" onClick={()=>router.push('/')} >返回首页</Button>
                </div>
            </form>
        </Form>
    )
}