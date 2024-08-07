'use client'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn, getBeijingDate, getBeijingTime } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { createAssignment, updateAssignment } from "@/lib/action/mongoIO"
import { Assignment } from "@/lib/schema/assign"
import { useState } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Type2Tag } from "@/lib/db/db"
import { OrganizationList, OrganizationProfile, OrganizationSwitcher } from "@clerk/nextjs"
import { calculateAverageScore, findHighestScoreDoc, findLowestScoreDoc } from "@/lib/dashboard"


export function NewAssignmentButton(
  {
    threadId,
    name,
    textbookId,
    type,
    orgId,
    userId
  }:
    {
      threadId: string,
      name: string,
      textbookId: string,
      type: string,
      orgId: string,
      userId: string
    }) {

  const formSchema = z.object({
    range: z.object({
      from: z.date({
        required_error: "A start date is required.",
      }),
      to: z.date({
        required_error: "A end date is required.",
      }),
    })
  })
  const today = getBeijingDate()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      range: {
        from: today,
        to: addDays(today, 3),
      },
    },
  })
  const router = useRouter()
  const [saveState, setSaveState] = useState('unsaved')

  function onSubmit(values: z.infer<typeof formSchema>) {
    const from = new Date(values.range.from);
    const to = new Date(values.range.to);
    const assignmentData: Assignment = {
      type: type,
      threadId: threadId,
      textbookId: textbookId,
      orgId: orgId,
      creatorId: userId,
      createAt: getBeijingTime(),
      updateAt: getBeijingTime(),
      startAt: new Date(from.setHours(0, 0, 0, 0)),
      endAt: new Date(to.setHours(23, 59, 59, 999))
    }
    setSaveState('saving')
    createAssignment(assignmentData).then(item => {
      item ? setSaveState('saved') : setSaveState('failed')
    })
  }

  //Welcome Messgae TTS
  useEffect(() => {
    if (saveState == 'saved') {
      router.refresh()
    } else if (saveState == 'failed') {

    }

  }, [saveState]);



  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-muted-foreground">
          布置
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <DialogHeader>
              <DialogTitle>布置新作业</DialogTitle>
              <DialogDescription className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-regular">
                    当前班级
                  </div>
                </div>
                <OrganizationSwitcher />
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-regular">
                    作业信息
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {name}
                      </CardTitle>
                      <CardDescription>
                        {Type2Tag(type)}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
                <FormField
                  control={form.control}
                  name="range"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-regular">开始与截止日期</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              id="date"
                              variant={"outline"}
                              className={cn(
                                "w-[300px] justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value?.from ? (
                                field.value.to ? (
                                  <>
                                    {format(field.value.from, "LLL dd, y")} -{" "}
                                    {format(field.value.to, "LLL dd, y")}
                                  </>
                                ) : (
                                  format(field.value.from, "LLL dd, y")
                                )
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={field.value?.from}
                            selected={field.value}
                            onSelect={field.onChange}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="submit" disabled={saveState == 'saving'}>
                  布置
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="secondary" disabled={saveState == 'saving'}>
                  取消
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )

}





export function ReviewAssignmentButton(
  {
    assignment,
    records,
    info,
    orgId,
    userId,
    studentIds
  }:
    {
      assignment: Assignment,
      info: any,
      records: any[],
      orgId: string,
      userId: string,
      studentIds: string[]
    }) {

  const formSchema = z.object({
    range: z.object({
      from: z.date({
        required_error: "A start date is required.",
      }),
      to: z.date({
        required_error: "A end date is required.",
      }),
    })
  })
  const today = getBeijingDate()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      range: {
        from: today,
        to: addDays(today, 3),
      },
    },
  })
  const router = useRouter()
  const [canModify, setCanModify] = useState(false)
  const [saveState, setSaveState] = useState('unsaved')
  function hoursUntil(endAt: Date): number {
    const now = new Date();
    const end = new Date(endAt)
    const differenceInMilliseconds = end.getTime() - now.getTime();
    const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
    return differenceInHours;
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const from = new Date(values.range.from);
    const to = new Date(values.range.to);
    const assignmentData: Assignment = {
      type: assignment.type,
      threadId: assignment.threadId,
      textbookId: assignment.textbookId,
      orgId: assignment.orgId,
      creatorId: assignment.creatorId,
      createAt: assignment.createAt as Date,
      updateAt: getBeijingTime(),
      startAt: new Date(from.setHours(0, 0, 0, 0)),
      endAt: new Date(to.setHours(23, 59, 59, 999))
    }
    setSaveState('saving')
    updateAssignment(assignmentData).then(item => {
      item ? setSaveState('saved') : setSaveState('failed')
    })
  }
  const averageScore = calculateAverageScore(records);
  const lowestScoreDoc = findLowestScoreDoc(records);
  const highestScoreDoc = findHighestScoreDoc(records);
  let hoursleft = hoursUntil(assignment.endAt)
  if(hoursleft<0){
    hoursleft = 0
  }else{
    hoursleft = +hoursleft.toFixed(0)
  }

  //Welcome Messgae TTS
  useEffect(() => {
    if (saveState == 'saved') {
      router.refresh()
    } else if (saveState == 'failed') {

    }

  }, [saveState]);

  return (
    <Dialog onOpenChange={() => setCanModify(false)}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default" className="">
          查看
        </Button>
      </DialogTrigger>
      <DialogContent >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <DialogHeader>
              <DialogTitle>作业概览</DialogTitle>
              <DialogDescription className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-regular">
                    当前班级
                  </div>
                </div>
                <OrganizationSwitcher />
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-regular">
                    作业信息
                  </div>
                  <Card>
                    <CardHeader className="flex flex-row justify-between">
                      
                      <div className="flex flex-col gap-2">
                      <CardTitle className="text-lg">
                        {info.name}
                      </CardTitle>
                      <CardDescription>
                        {Type2Tag(assignment.type)}
                      </CardDescription>
                      </div>
                      <div className="flex flex-col justify-center text-center">
                        <div className="text-xl font-medium text-primary">
                        {hoursleft.toFixed(0)} <p className="inline text-xs ">小时</p>
                        </div>
                        <div className="text-muted-foreground text-xs">
                        距离截止时间
                        </div>
                        
                      </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 border-t py-4">
                      <div className="font-medium flex flex-col justify-center text-center">
                        <div className="text-xl text-primary">
                          {`${records.length} / ${studentIds.length}`}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          已提交
                        </div>
                      </div>
                      <div className="font-medium flex flex-col justify-center text-center">
                        <div className="text-xl text-primary">
                          {averageScore}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          平均分
                        </div>
                      </div>
                    
                    </CardContent>
                    <CardFooter  className="flex flex-row justify-end">
                      <Button size="sm" type="button" variant="outline" onClick={()=>router.push(`/dashboard/assignment/${assignment.threadId}`)}>
                        作业详情
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                <FormField
                  control={form.control}
                  name="range"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-regular">开始与截止日期</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild disabled={!canModify}>
                          <FormControl>
                            <Button
                              id="date"
                              variant={"outline"}
                              className={cn(
                                "w-[300px] justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value?.from ? (
                                field.value.to ? (
                                  <>
                                    {format(field.value.from, "LLL dd, y")} -{" "}
                                    {format(field.value.to, "LLL dd, y")}
                                  </>
                                ) : (
                                  format(field.value.from, "LLL dd, y")
                                )
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={field.value?.from}
                            selected={field.value}
                            onSelect={field.onChange}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>

              {canModify ?

                <Button variant="destructive" type="submit" disabled={saveState == 'saving'}>
                  提交
                </Button>

                :
                <Button variant="outline" type="button" disabled={saveState == 'saving'} onClick={() => setCanModify(true)}>
                  修改
                </Button>
              }


              <DialogClose asChild>
                <Button variant="secondary" disabled={saveState == 'saving'}>
                  取消
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )

}

