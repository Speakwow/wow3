"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type AssignmentRecord = {
    threadId:string,
    userId:string,
    username:string,
    status: "未完成" | "已完成",
    score:number,
    rank:number,
    finishAt:Date
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
  },
  {
    accessorKey: "rank",
    header: "排名",
  },
  {
    accessorKey: "finishAt",
    header: "提交时间",
  },
]
