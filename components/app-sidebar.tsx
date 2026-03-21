"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  FileEdit,
  TrendingUp,
  Receipt,
  DollarSign,
  Users,
  FileSignature,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { title: "ダッシュボード", href: "/dashboard", icon: LayoutDashboard },
  { title: "タスク", href: "/tasks", icon: CheckSquare },
  { title: "請求書", href: "/invoices", icon: FileText },
  { title: "見積もり", href: "/estimates", icon: FileEdit },
  { title: "収支", href: "/finances", icon: TrendingUp },
  { title: "経費", href: "/expenses", icon: Receipt },
  { title: "キャッシュフロー", href: "/cashflow", icon: DollarSign },
  { title: "顧客", href: "/customers", icon: Users },
  { title: "契約", href: "/contracts", icon: FileSignature },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>メニュー</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
