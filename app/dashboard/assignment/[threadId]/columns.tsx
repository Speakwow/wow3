"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UTC2Beijing } from "@/lib/tools"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type AssignmentRecord = {
  recordId: string
  threadId: string,
  type: string,
  userId: string,
  username: string,
  status: "未完成" | "已完成",
  score: number,
  rank: number,
  finishAt: Date
}

export const columns: ColumnDef<AssignmentRecord>[] = [
  {
    accessorKey: "username",
    header: "姓名",
  },
  {
    accessorKey: "status",
    header: "状态",
  },
  {
    accessorKey: "score",
    header: "得分",
    cell: ({ row }) =>{
      const record = row.original
      if (record.score){ 
        return (
          <div>{record.score.toFixed(1)}</div>
        )
      }
    },
  },
  {
    accessorKey: "rank",
    header: "排名",
  },
  {
    id: "finishAt",
    header: "提交时间",
    cell: ({ row }) => {
      const record = row.original
      if (record.finishAt) {
        return (
          <div>{UTC2Beijing(new Date(record.finishAt).toISOString())}</div>
        )
      } else {
        return(
        <div>-</div>
        )
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const record = row.original

      return (
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
            ><a href={`/record/${record.recordId}/${record.type}`}>查看详情</a>

            </DropdownMenuItem>
            {/* <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }

]
