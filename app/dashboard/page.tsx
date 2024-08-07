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
import { redirect } from "next/navigation"

export default function Dashboard() {
  redirect('./dashboard/plan')
}
