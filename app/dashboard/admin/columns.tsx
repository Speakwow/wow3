"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UTC2Beijing } from "@/lib/tools"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type MyRecord = {
    name:string,
    score:number,
    grade:string,
    finishAt:Date,
    type:string,
    tag:string,
    id:string,
}

export const columns: ColumnDef<MyRecord>[] = [
  {
    accessorKey: "name",
    header: "名称",
  },
  {
    accessorKey: "tag",
    header: "类型",
  },
  {
    accessorKey: "grade",
    header: "等级",
  },
  // {
  //   id: "finishAt",
  //   header: "提交时间",
  //   cell: ({ row }) => {
  //     const record = row.original
  //     if (record.finishAt) {
  //       return (
  //         <div>{UTC2Beijing(new Date(record.finishAt).toISOString()).split(' ')[0]}</div>
  //       )
  //     } else {
  //       return(
  //       <div>-</div>
  //       )
  //     }
  //   },
  // },
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
            ><a href={`/record/${record.id}/${record.type}`}>查看详情</a>

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
