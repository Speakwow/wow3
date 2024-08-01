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

export default function Dashboard({ params }: { params: { class: string } }) {
  const today = new Date()
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex flex-col gap-2">
                <div className="text-sm font-medium text-primary">当前作业</div>
                <div className="text-xl font-bold"> 课程跟读练习 </div>
                <div>
                  <p className="inline text-xs text-muted-foreground font-normal">已提交 : </p>
                  <p className="inline text-sm text-primary font-bold"> 37 </p>
                  <p className="inline font-normal text-muted-foreground text-xs">/ 52</p> </div>
              </CardTitle>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  76.3
                </div>
                <p className="text-xs text-muted-foreground">
                  平均分
                </p>
              </div>
            </CardHeader>

            <CardFooter className="flex flex-row justify-between gap-4 ">
              <div className="flex flex-row gap-2">
                <Button variant="outline" className="text-xs h-6">一键催缴</Button>
                <Button variant="outline" className="text-xs h-6">成绩详情</Button>
              </div>
              <Badge variant="destructive">13小时后截止</Badge>
            </CardFooter>

          </Card>
          <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex flex-col gap-2">
                <div className="text-sm font-medium text-primary">学习进度</div>
                <div className="text-xl font-bold"> Unit 1 Teenage Life </div>
                <div>
                  <p className="inline text-xs text-muted-foreground font-normal">重难点 : </p>
                  <p className="inline text-sm text-primary font-bold"> 将来式语法 </p>
                  </div>
              </CardTitle>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  简单
                </div>
                <p className="text-xs text-muted-foreground">
                  难度
                </p>
              </div>
            </CardHeader>

            <CardFooter className="flex flex-row justify-between gap-4 ">
              <div className="flex flex-row gap-2">
                <Button variant="outline" className="text-xs h-6">查看作业</Button>
                <Button variant="outline" className="text-xs h-6">更改课程</Button>
              </div>
              
            </CardFooter>

          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                本月得分
              </CardTitle>
              <UploadCloudIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"> 4.61 </div>
              <p className="text-xs text-muted-foreground">
                比上月提升 0.7
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                薄弱项
              </CardTitle>
              <ArrowDownRightSquareIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">发音准确度</div>
              <p className="text-xs text-muted-foreground">
                高于全国 21% 的班级
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">周均练习时长</CardTitle>
              <PercentDiamondIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"> 57 min</div>
              <p className="text-xs text-muted-foreground">
                高于全国 79% 的班级，建议减负
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">待处理任务</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                新作业待布置 等 3 条未读
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-4 xl:grid-cols-4">
        <Card className="col-span-2">
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


          <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>作业批阅</CardTitle>
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
                      AI评分
                    </TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium"> 词汇跟读练习</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        Unit 1 Teenage Life
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-column">
                      Sale
                    </TableCell>
                    <TableCell>
                      <Badge className="text-xs " variant="secondary" >
                        已收齐
                      </Badge>
                    </TableCell>
                    <TableCell>
                      B+
                    </TableCell>
                    <TableCell className="text-right"><Button size="sm" variant="outline">审阅</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium"> 课程跟读练习</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        Unit 1 Teenage Life
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-column">
                      Sale
                    </TableCell>
                    <TableCell>
                      <Badge className="text-xs " variant="destructive" >
                        未收齐
                      </Badge>
                    </TableCell>
                    <TableCell>
                      B
                    </TableCell>
                    <TableCell className="text-right"><Button size="sm" variant="outline">审阅</Button></TableCell>
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
