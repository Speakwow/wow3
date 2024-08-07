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
import { createAssignment } from "@/lib/action/mongoIO"
import { Assignment } from "@/lib/schema/assign"
import { useState } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Type2Tag } from "@/lib/db/db"
import { OrganizationList, OrganizationProfile, OrganizationSwitcher } from "@clerk/nextjs"


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
                <OrganizationSwitcher/>
                <div className="flex flex-col gap-2">
                <div className="text-xs font-regular">
                  作业信息
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>
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
          查看
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
                <OrganizationSwitcher/>
                <div className="flex flex-col gap-2">
                <div className="text-xs font-regular">
                  作业信息
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>
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

