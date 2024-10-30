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
  userId: string,
  username: string,
}

export const columns: ColumnDef<AssignmentRecord>[] = [
  {
    accessorKey: "username",
    header: "姓名",
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => {
      const record = row.original

      return (
        
            <Button variant="outline" className="">
              <a href={`/dashboard/analytics/${record.userId}`}>查看分析</a>
            </Button>
          
      )
    },
  }

]
