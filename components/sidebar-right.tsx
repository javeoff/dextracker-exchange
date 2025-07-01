import * as React from "react"

import {
  Sidebar,
  SidebarContent
} from "@/components/ui/sidebar"
import { Swap } from "./swap"

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex w-(--sidebar-width)"
      {...props}
    >
      <SidebarContent className="my-5 px-2">
        <Swap />
      </SidebarContent>
    </Sidebar>
  )
}
