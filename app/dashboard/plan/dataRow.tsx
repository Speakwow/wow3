import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TableRow, TableCell } from "@/components/ui/table"
import { getRecordsForAssignment } from "@/lib/action/mongoIO"
import { Type2Tag } from "@/lib/db/db"
import { Link1Icon } from "@radix-ui/react-icons"
import Link from "next/link"
import { useState } from "react"
import { Suspense } from 'react';
import { NewAssignmentButton } from "./action"
import { Loader2Icon, LoaderIcon } from "lucide-react"






export async function AssignmentRow(
    {
        unit,
        name,
        type,
        threadId,
        orgId,
        studentIds,
        textbookId,
        userId
    }: {
        unit: number,
        name: string,
        type: string,
        threadId: string,
        orgId: string,
        studentIds: string[],
        textbookId: string,
        userId: string
    }) {
    const today = Date.now()
    const countStudents = studentIds.length
    let countFinished = 0
    let status = '待布置'
    let endDate = '-'
    const data = await getRecordsForAssignment(threadId, orgId)
    if (data) {
        console.log(data.endAt)
        countFinished = data.records.length
        status = `进行中:${countFinished}/${countStudents}`
        endDate = data.endAt
    }

    return (
        <TableRow key={threadId}>
            <TableCell>
                <div className="font-medium">
                    Unit {unit}
                </div>
            </TableCell>
            <TableCell>
                <div className="flex flex-row gap-2">
                    <div className="font-medium"> {name}</div><Link href={`/${type}/${threadId}`}><Link1Icon color="gray" /></Link>
                </div>

            </TableCell>
            <TableCell className="font-medium">
                <Badge variant="outline">
                    {Type2Tag(type)}
                </Badge>
            </TableCell>
            <TableCell className="font-medium">
                {status}
            </TableCell>
            <TableCell className="font-medium">
                {endDate.split('T')[0] as string}
            </TableCell>
            <TableCell className="text-right">
                <NewAssignmentButton
                    threadId={threadId}
                    name={name}
                    textbookId={textbookId}
                    type={type}
                    orgId={orgId}
                    userId={userId}
                />
            </TableCell>
        </TableRow>
    )
}


export function AssignmentRowLoading(
    {
        unit,
        name,
        type,
        threadId,
        orgId,
        studentIds,
        textbookId,
        userId
    }: {
        unit: number,
        name: string,
        type: string,
        threadId: string,
        orgId: string,
        studentIds: string[],
        textbookId: string,
        userId: string
    }) {

    return (
        <TableRow key={threadId}>
            <TableCell>
                <div className="font-medium">
                    Unit {unit}
                </div>
            </TableCell>
            <TableCell>
                <div className="flex flex-row gap-2">
                    <div className="font-medium"> {name}</div><Link href={`/${type}/${threadId}`}><Link1Icon color="gray" /></Link>
                </div>

            </TableCell>
            <TableCell className="font-medium">
                <Badge variant="outline">
                    {Type2Tag(type)}
                </Badge>
            </TableCell>
            <TableCell className="font-medium">
                <LoaderIcon className="animate-spin w-4 h-4" />
            </TableCell>
            <TableCell className="font-medium">
                <LoaderIcon className="animate-spin w-4 h-4" />
            </TableCell>
            <TableCell className="text-right">
                <Button size="sm" variant="outline" className="text-muted-foreground" disabled>
                    <LoaderIcon className="animate-spin w-4 h-4" />
                </Button>
            </TableCell>
        </TableRow>
    )
}