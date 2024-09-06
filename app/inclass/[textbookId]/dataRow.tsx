import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TableRow, TableCell } from "@/components/ui/table"
import { getAnyRecord, getRecordsForAssignment } from "@/lib/action/mongoIO"
import { Type2Tag } from "@/lib/db/db"
import { Link1Icon } from "@radix-ui/react-icons"
import Link from "next/link"
import { Loader2Icon, LoaderIcon, MoreHorizontal } from "lucide-react"
import { getBeijingTime, Score2Grade, UTC2Beijing } from "@/lib/tools"
import { isAfter, isBefore, isWithinInterval } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"







export async function TextbookRow(
    {
        unit,
        name,
        type,
        threadId,
        textbookId,
        userId
    }: {
        unit: number,
        name: string,
        type: string,
        threadId: string,
        textbookId: string,
        userId: string
    }) {
    let status = '未完成'
    type Grade = 'A' | 'B' | 'C' | 'D' | 'F' | '未完成';
    let grade: Grade = '未完成'
    const data = await getAnyRecord(userId, threadId, type)
    if (data) {
        status = '已完成'
        grade = Score2Grade(data.score) as Grade
    }
    const GradeColorMap: Record<Grade, string> = {
        'A':'text-primary',
        'B':'text-primary',
        'C':'text-amber-500',
        'D':'text-amber-500',
        'F':'text-red-600',
        '未完成':'text-muted-foreground'
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
                    <div className="font-medium"> {name}</div>
                </div>
            </TableCell>
            <TableCell className="font-medium">
                <Badge variant="outline">
                    {Type2Tag(type)}
                </Badge>
            </TableCell>
            <TableCell className={`font-medium ${GradeColorMap[grade]}`}>
                {grade}
            </TableCell>
            <TableCell className="text-right">
                {
                    status == '未完成'?
                    <Button size='sm' asChild>
                        <Link href={`/${type}/${threadId}`}>
                        练习
                        </Link>
                    </Button>
                    :
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuItem
                        ><a href={`/${type}/${threadId}`}>再次挑战</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                        ><a href={`/record/${data._id}/${type}`}>查看详情</a>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                }
              
            </TableCell>
        </TableRow>
    )
}


export function TextbookLoading(
    {
        unit,
        name,
        type,
        threadId,

        userId
    }: {
        unit: number,
        name: string,
        type: string,
        threadId: string,
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
            <TableCell className="text-right">
                <Button size="sm" variant="outline" className="text-muted-foreground" disabled>
                    <LoaderIcon className="animate-spin w-4 h-4" />
                </Button>
            </TableCell>
        </TableRow>
    )
}