"use client"

import React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { LogOut } from "lucide-react"
import { Button } from "./ui/button"
// import { signOut } from "next-auth/react"

export type AppSidebar = {
  name?: string;
  items: {
    title: string;
    url: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }[]
}

export function AppSidebar({ sidebar }: { sidebar: AppSidebar[] }) {
  const handleSignOut = () => {
    // signOut({ callbackUrl: '/login' })
    window.location.href = "/"
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <NavUser />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {
          sidebar.map((group, index) => 
            <SidebarGroup key={index}>
              {
                group.name && <SidebarGroupLabel>{group.name}</SidebarGroupLabel>
              }
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url} prefetch={true}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        }
      </SidebarContent>
      <SidebarFooter>
        <section className="space-y-2 grid">
          <ThemeToggle />
          <Button
            size="icon"
            className="w-8 h-8 p-0"
            onClick={handleSignOut}
            type="button"
          >
            <LogOut />
          </Button>
        </section>
      </SidebarFooter>
    </Sidebar>
  )
}