import * as React from "react"

import {
  Sidebar,
  SidebarContent
} from "@/components/ui/sidebar"
import { Swap } from "./swap"

export function SidebarRight({
  exchange,
  setExchange,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  exchange: string | undefined;
  setExchange: React.Dispatch<React.SetStateAction<string | undefined>>;
}) {
  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex w-(--sidebar-width)"
      {...props}
    >
    <SidebarContent className="px-2">
        <Swap exchange={exchange} setExchange={setExchange} />
      </SidebarContent>
    </Sidebar>
  )
}
