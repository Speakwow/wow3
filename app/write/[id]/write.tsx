"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { saveWriteRecord, updateScenario } from "@/lib/action/mongoIO"
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
import {  genWriteFeedback, improveWriting } from "@/lib/action/gen"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import WriteReportRadar from "@/components/radar-chart"
import { Score2Grade } from "@/lib/tools"


const formSchema = z.object({
    content: z.string().min(4, {
        message: "至少输入 20 个字符",
    }),
})


export function WriteForm({ userId, write }: { userId: string, write: any }) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: write.first_line as string
        }

    })
    const router = useRouter()
    const [saveState, setSaveState] = useState('unsaved')
    const [hintState, setHintState] = useState('NO_HINT')
    const [content, setContent] = useState('')
    const [report, setReport] = useState<any>()
    const [polished, setPolished] = useState('')


    async function onSubmit(values: z.infer<typeof formSchema>) {
        setContent(values.content)
        setSaveState('saving')
        console.log(values)
        const [feedback, improvedResult] = await Promise.all([
            genWriteFeedback(values.content, write.topic, write.level, write.word_count),
            improveWriting(values.content, write.topic, write.level, write.word_count)
        ])
        setReport(feedback)
        setPolished(improvedResult as string)
        saveWriteRecord(userId, write._id, values.content, {...feedback,polished:improvedResult}).then(res => setSaveState('saved'))
        console.log('submit success')
        // router.push('/scenario/' + id)
    }

    const [isGenerating, setIsGenerating] = useState(false)
    async function getHint(values: z.infer<typeof formSchema>) {
        setIsGenerating(true)
        const feedback = await genWriteFeedback(values.content, write.topic, write.level, write.word_count)
        await Promise.all([

        ]);
    }

    if (saveState === 'saved') {
        return (
            <div className="flex flex-col gap-4 justify-center items-center">


                <Card className="flex flex-col  w-full">
                    <CardHeader>
                        <CardTitle className="">
                            智能评分
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 items-center">
                        <div className="w-full flex flex-col justify-center items-center">

                            <Card className="flex flex-col justify-center text-center bg-primary  py-4 border-primary w-fit p-6">
                                <div className="text-primary text-4xl text-white font-medium ">
                                    {Score2Grade(report.score)}
                                </div>
                                <div className="text-muted-foreground text-white">
                                    总评
                                </div>
                            </Card>
                        </div>
                        <div className=" col-span-2 text-xs">
                            <WriteReportRadar data={report} />
                        </div>
                    </CardContent>

                </Card>
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="">
                            智能评语👨‍🏫
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-primary font-medium">
                        {report.w_feedback}
                    </CardContent>
                </Card>
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="">
                            练习结果
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {content}
                    </CardContent>
                </Card>
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="">
                            表达升级✨
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-primary font-medium">
                        {polished}
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
                    <div className="col-span-2">
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
