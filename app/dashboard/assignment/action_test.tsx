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
import { CalendarDaysIcon, Calendar as CalendarIcon } from "lucide-react"
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
import { calculateAverageScore, findHighestScoreDoc, findLowestScoreDoc, hoursUntil } from "@/lib/dashboard"
import { Label } from "@/components/ui/label"


export function TestAssignmentButton(
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
      createAt: getBeijingTime() as Date,
      updateAt: getBeijingTime() as Date,
      startAt: new Date(from.setHours(0, 0, 0, 0)),
      endAt: new Date(to.setHours(23, 59, 59, 999))
    }
    setSaveState('saving')
    createAssignment(assignmentData).then(item => {
      window.location.reload()
    })
  }

  //Welcome Messgae TTS



  return (
    <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">Test</Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Select a date range</DialogTitle>
        <DialogDescription>Choose your travel dates to check availability.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-6 py-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarDaysIcon className="mr-2 h-4 w-4" />
              Pick a date range
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="range" numberOfMonths={2} />
          </PopoverContent>
        </Popover>
        <div className="flex justify-end gap-2">
          <div>
            <Button variant="outline">Cancel</Button>
          </div>
          <Button>Apply</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
  )

}
