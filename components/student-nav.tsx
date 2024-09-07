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
                    href="/"
                    className={`truncate transition-colors hover:text-foreground ${activePage == '/' ? 'text-foreground underline ':' text-muted-foreground '} `}
                >
                    首页
                </Link>
                </Button>
                <Button variant="link">
                <Link
                    href="/inclass"
                    className={`truncate transition-colors hover:text-foreground ${activePage == 'inclass' ? 'text-foreground underline ':' text-muted-foreground '} `}
                >
                    课内巩固
                </Link>
                </Button>
                <Button variant="link">
                <Link
                    href="/afterclass"
                    className={`truncate transition-colors hover:text-foreground ${activePage == 'afterclass' ? 'text-foreground underline ':' text-muted-foreground '} `}
                >
                    课外拓展
                </Link>
                </Button>
                <Button variant="link">
                <Link
                    href="/myrecords"
                    className={`truncate transition-colors hover:text-foreground ${activePage == 'myrecords' ? 'text-foreground underline ':' text-muted-foreground '}`}
                >
                    成绩详情
                </Link>
                </Button>
            </nav>
            
        </header>
    )
}