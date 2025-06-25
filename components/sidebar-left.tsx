"use client"

import * as React from "react"
import {
  AudioWaveform,
  Blocks,
  Calendar,
  ChevronDown,
  Command,
  Home,
  Inbox,
  MessageCircleQuestion,
  Search,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react"

import { NavFavorites } from "@/components/nav-favorites"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavWorkspaces } from "@/components/nav-workspaces"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: Command,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Trending",
      url: "/",
      icon: Home,
    },
  ],
}

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <SidebarMenuButton className="w-fit px-1.5">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-5 items-center justify-center rounded-md">
            <Command className="size-3" />
          </div>
          <span className="truncate font-medium">DexTracker</span>
        </SidebarMenuButton>
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
