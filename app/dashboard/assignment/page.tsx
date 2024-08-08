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
import { getOrgStudents, getTextbookData } from "@/lib/action/mongoIO"
import { Type2Tag, typeMap } from "@/lib/db/db"
import { Link1Icon } from "@radix-ui/react-icons"
import { auth } from "@clerk/nextjs"
import { AssignmentRow, AssignmentRowLoading } from "./dataRow"
import { Suspense } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"


export default async function Plan() {
    const today = new Date()
    const { userId, orgId } = auth();
    const textbookId = "66b0937bfdcc2483666628a5"
    const data = await getTextbookData(textbookId)
    const studentIds = await getOrgStudents(orgId as string)

    return (
        <div className="flex h-screen w-full flex-col">
            <ScrollArea className="h-full">
            <Header activePage="assignment"/>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Breadcrumb>
                    <BreadcrumbList>
                    <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            <BreadcrumbPage>概览</BreadcrumbPage>
                        </BreadcrumbItem>
                        
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    <Card className="col-span-4 h-full">
                        <CardHeader className="flex flex-row items-center">
                            <div className="grid gap-2">
                                <CardTitle>{data.name}</CardTitle>
                                <CardDescription>
                                    课程导览
                                </CardDescription>
                            </div>
                            <div className="ml-auto flex flex-row gap-2">
                                {/* <Button asChild size="sm" className="ml-auto gap-1" variant="outline">
                                    <Link href="#">
                                        查看全部
                                    </Link>
                                </Button> */}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            单元
                                        </TableHead>
                                        <TableHead>
                                            作业
                                        </TableHead>
                                        <TableHead>
                                            类型
                                        </TableHead>
                                        <TableHead>
                                            状态
                                        </TableHead>
                                        <TableHead>
                                            截止日期
                                        </TableHead>
                                        <TableHead className="text-right">操作</TableHead>
                                    </TableRow>
                                </TableHeader>
                                
                                <TableBody>
                                    {
                                        data.units.map((unit: { unit: number, lessons: any[] }) => {
                                            return unit.lessons.map(
                                                lesson => {
                                                    if (lesson.data) {
                                                        return (
                                                            <Suspense key={lesson.id} fallback={                                                                
                                                            <AssignmentRowLoading
                                                                unit={unit.unit}
                                                                name={lesson.data.name}
                                                                type={lesson.type}
                                                                threadId={lesson.id}
                                                                orgId={orgId as string}
                                                                studentIds={studentIds}
                                                                textbookId={textbookId}
                                                                userId={userId as string} 
                                                                />}>
                                                                <AssignmentRow
                                                                    unit={unit.unit}
                                                                    name={lesson.data.name}
                                                                    type={lesson.type}
                                                                    threadId={lesson.id}
                                                                    orgId={orgId as string}
                                                                    studentIds={studentIds}
                                                                    textbookId={textbookId}
                                                                    userId={userId as string} 
                                                                    />
                                                            </Suspense>
                                                        )
                                                    }
                                                    return null
                                                }
                                            )
                                        })
                                    }

                                </TableBody>
                            
                            </Table>
                        </CardContent>
            
                    </Card>
                    




                </div>
            </main>
            </ScrollArea>
        </div>
    )
}


