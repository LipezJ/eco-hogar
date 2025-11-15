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
import { Link } from '@/lib/router';
import { LogOut } from "lucide-react"
// import { logout } from "@/lib/actions/auth-actions"
import { Button } from "./ui/button"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "@/lib/router"

export type AppSidebar = {
  name?: string;
  items: {
    title: string;
    url: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }[]
}

export function AppSidebar({ sidebar }: { sidebar: AppSidebar[] }) {
  const { logout } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await logout()
      router.navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
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
                        <Link href={item.url}>
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
