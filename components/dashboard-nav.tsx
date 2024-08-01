import Link from "next/link"
import { CircleUser, Menu, Package2, Search } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "./ui/button"
import { Sheet, SheetTrigger, SheetContent } from "./ui/sheet"
import { Input } from "./ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

export function Header() {
    return (
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                <Link
                    href="/103/analytics"
                    className="truncate text-muted-foreground transition-colors hover:text-foreground"
                >
                    数据分析
                </Link>
                <Link
                    href="/103/analytics"
                    className="truncate text-muted-foreground transition-colors hover:text-foreground"
                >
                    作业布置
                </Link>
                <Link
                    href="/organization-profile"
                    className="truncate text-muted-foreground transition-colors hover:text-foreground"
                >
                    成员管理
                </Link>
                <Link
                    href="#"
                    className="truncate text-muted-foreground transition-colors hover:text-foreground"
                >
                    资源库
                </Link>
                {/* <Link
                    href="#"
                    className="truncate text-muted-foreground transition-colors hover:text-foreground"
                >
                    设置
                </Link> */}
            </nav>
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <nav className="grid gap-6 text-lg font-medium">
                        <Link
                            href="#"
                            className="flex items-center gap-2 text-lg font-semibold"
                        >
                            <Package2 className="h-6 w-6" />
                            <span className="sr-only">Acme Inc</span>
                        </Link>
                        <Link
                            href="/103/analytics"
                            className="truncate text-muted-foreground hover:text-foreground"
                        >
                            数据分析
                        </Link>
                        <Link
                            href="/103"
                            className="truncate text-muted-foreground hover:text-foreground"
                        >
                            班级管理
                        </Link>
                        <Link
                            href="#"
                            className="truncate text-muted-foreground hover:text-foreground"
                        >
                            资源库
                        </Link>
                        {/* <Link
                            href="#"
                            className="truncate text-muted-foreground hover:text-foreground"
                        >
                            设置
                        </Link> */}
                    </nav>
                </SheetContent>
            </Sheet>
            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                <form className="ml-auto flex-1 sm:flex-initial">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search products..."
                            className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                        />
                    </div>
                </form>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full">
                            <CircleUser className="h-5 w-5" />
                            <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>张小斐</DropdownMenuLabel>
                        <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">zxf@tsinghua.edu.cn</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem><Link href="/setting/user">设置</Link></DropdownMenuItem>
                        <DropdownMenuItem>帮助</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>登出</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}