import { ModeToggle } from "./mode-toggle"
import { NavUser } from "./nav-user"

const user = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
}
export function Header() {
  return (
    <div className="w-full border border-b fixed top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full flex justify-between px-5 py-1">
        <div>
        </div>
        <div className="flex gap-2 items-center">
          <ModeToggle />
          <NavUser user={user} />
        </div>
      </div>
    </div>
  )
}
