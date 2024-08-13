import Link from "next/link"
import { CircleUser, Menu, Package2, Search } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "./ui/button"
import { Sheet, SheetTrigger, SheetContent } from "./ui/sheet"
import { Input } from "./ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { UserButton } from "@clerk/nextjs"

export function Header({activePage}:{activePage:string}) {
    return (
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
            <nav className=" flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                <Button variant="link" >
                <Link
                    href="/dashboard/assignment"
                    className={`truncate transition-colors hover:text-foreground ${activePage == 'assignment' ? 'text-foreground underline ':' text-muted-foreground '} `}
                >
                    作业管理
                </Link>
                </Button>
                <Button variant="link">
                <Link
                    href="/dashboard/analytics"
                    className={`truncate transition-colors hover:text-foreground ${activePage == 'analytics' ? 'text-foreground underline ':' text-muted-foreground '} `}
                >
                    成绩分析
                </Link>
                </Button>
                <Button variant="link">
                <Link
                    href="/dashboard/student"
                    className="truncate text-muted-foreground transition-colors hover:text-foreground"
                >
                    学生管理
                </Link>
                </Button>
                <Button variant="link">
                <Link
                    href="#"
                    className="truncate text-muted-foreground transition-colors hover:text-foreground"
                >
                    资源库
                </Link>
                </Button>
                {/* <Link
                    href="#"
                    className="truncate text-muted-foreground transition-colors hover:text-foreground"
                >
                    设置
                </Link> */}
            </nav>
            
        </header>
    )
}