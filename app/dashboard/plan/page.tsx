import Link from "next/link"
import {
    Activity,
    ArrowDownRightSquareIcon,
    ArrowUpRight,
    CircleUser,
    CreditCard,
    DeleteIcon,
    DollarSign,
    Menu,
    Package2,
    PercentDiamondIcon,
    PointerIcon,
    Search,
    Trash2Icon,
    TrashIcon,
    UploadCloudIcon,
    Users,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Header } from "@/components/dashboard-nav"

export default function Plan({ params }: { params: { class: string } }) {
    const today = new Date()
    return (
        <div className="flex min-h-screen w-full flex-col">
            <Header />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    <Card className="col-span-4">
                        <CardHeader className="flex flex-row items-center">
                            <div className="grid gap-2">
                                <CardTitle>教学计划</CardTitle>
                                <CardDescription>
                                </CardDescription>
                            </div>
                            <div className="ml-auto flex flex-row gap-2">
                                <Button asChild size="sm" className="ml-auto gap-1" variant="outline">
                                    <Link href="#">
                                        查看全部
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>作业</TableHead>
                                        <TableHead className="hidden xl:table-column">
                                            Type
                                        </TableHead>
                                        <TableHead>
                                            状态
                                        </TableHead>
                                        <TableHead>
                                            难度
                                        </TableHead>
                                        <TableHead className="text-right">操作</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>
                                            <div className="font-medium"> 模拟对话练习</div>
                                            <div className="hidden text-sm text-muted-foreground md:inline">
                                                Unit 1 Teenage Life
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden xl:table-column">
                                            Sale
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="text-xs ">
                                                今日
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            简单
                                        </TableCell>
                                        <TableCell className="text-right"><Button size="sm">布置</Button></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <div className="font-medium"> 发音专项练习</div>
                                            <div className="hidden text-sm text-muted-foreground md:inline">
                                                Unit 1 Teenage Life
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden xl:table-column">
                                            Sale
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="text-xs " variant="outline" >
                                                计划
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            中等
                                        </TableCell>
                                        <TableCell className="text-right"><Button size="sm" variant="outline" className="text-muted-foreground">提前</Button></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <div className="font-medium">短语跟读练习</div>
                                            <div className="hidden text-sm text-muted-foreground md:inline">
                                                Unit 1 Teenage Life
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden xl:table-column">
                                            Sale
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="text-xs " variant="outline" >
                                                计划
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            中等
                                        </TableCell>
                                        <TableCell className="text-right"><Button size="sm" variant="outline" className="text-muted-foreground">提前</Button></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <div className="font-medium"> 清浊音专项练习</div>
                                            <div className="hidden text-sm text-muted-foreground md:inline">
                                                Unit 1 Teenage Life
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden xl:table-column">
                                            Sale
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="text-xs " variant="secondary" >
                                                智能建议
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            中等
                                        </TableCell>
                                        <TableCell className="text-right"><Button size="sm" variant="outline" className="text-muted-foreground">提前</Button></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>




                </div>
            </main>
        </div>
    )
}
