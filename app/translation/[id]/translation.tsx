"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { saveTranslationRecord, saveWriteRecord, updateScenario } from "@/lib/action/mongoIO"
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
import { useRouter } from "next/navigation"
import { useState } from "react"
import { genTranslationFeedback, genWriteFeedback, improveWriting } from "@/lib/action/gen"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { countWords, Score2Grade } from "@/lib/tools"
import { TextWithHighlights } from "./correction"


const formSchema = z.object({
    content: z.string().min(4, {
        message: "至少输入 20 个字符",
    }),
})


export function TranslationForm({ userId, write }: { userId: string, write: any }) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: write.first_line as string
        }

    })
    const router = useRouter()
    const [saveState, setSaveState] = useState('unsaved')
    const [content, setContent] = useState('')
    const [report, setReport] = useState<any>()
    const [polished, setPolished] = useState('')


    async function onSubmit(values: z.infer<typeof formSchema>) {
        setContent(values.content)
        setSaveState('saving')
        console.log(values)
        const feedback = await genTranslationFeedback(values.content, write.topic)
        setReport(feedback)
        saveTranslationRecord(userId, write._id, values.content, feedback).then(res => setSaveState('saved'))
        console.log('submit success')
    }


    if (saveState === 'saved') {
        return (
            <div className="flex flex-col gap-4 justify-center items-center">

                <Card className="w-full flex flex-row gap-2 p-6 items-center gap-8">
                    
                        <CardTitle className="">
                            练习评分
                        </CardTitle>
                    
                   
                        <Button variant="default" size="lg" className="text-2xl">
                            {Score2Grade(report.score)}
                        </Button>
                    

                </Card>

                <Card className="w-full">
                    <CardHeader className="">
                        <CardTitle className="">
                            智能批改
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TextWithHighlights text={report.correction} />
                    </CardContent>

                </Card>
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="select-none">
                            标准答案
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="select-none text-primary font-medium">
                        {report.standard_answer}
                    </CardContent>
                </Card>
                <div className="flex flow-row justify-center gap-4">
                    <Button size="lg" onClick={() => router.push('/')}>
                        完成练习
                    </Button>
                    {/* <Button onClick={() => router.push(`/scenario/`)}>
                        
                    </Button> */}
                </div>
            </div>
        )
    } else if (saveState === 'saving') {
        return (
            <div className="text-center py-24 text-xl text-primary font-black">
                <div className="animate-pulse">
                    🤖 AI评分中...
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
                    <div className="col-span-2 flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="">✍️ 开始写作吧！</FormLabel>
                                    <FormControl>
                                        <Textarea className="h-64 border-primary " placeholder="请输入..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    <div className="w-full flex justify-end">
                                        <FormLabel className="text-right text-muted-foreground text-xs">字数统计：{countWords(field.value ?? '')}词</FormLabel>
                                    </div>
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
