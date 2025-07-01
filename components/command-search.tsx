"use client"

import { type DialogProps } from "@radix-ui/react-dialog"
import { cn, getBigNumber, getExchangeName } from "@/lib/utils"
import {
  Command,
  CommandEmpty, CommandItem,
  CommandInput, CommandList
} from "./ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { useDebounce } from '@custom-react-hooks/use-debounce'
import { useIsMac } from "@/hooks/use-is-mac"
import { useState, useEffect, ReactNode } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface Coin {
  id: string;
  cexes: string[];
  liquidity: number;
  mcap: number;
  symbol: string;
  name: string;
  icon: string;
}

export function CommandSearch({
  children,
  onClick,
  ...props
}: DialogProps & {
  children?: ReactNode
  onClick?: (coin: Coin) => void;
}) {
  const router = useRouter();
  const isMac = useIsMac()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState<string>();
  const [setDebouncedSearch] = useDebounce(
    (val) => {
      setSearch(val);
    },
    500,
    { maxWait: 500 },
  );
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    if (!search) {
      return;
    }
    const loadSearch = async () => {
      const res = await fetch('https://datapi.jup.ag/v1/assets/search?query=' + search)
      const data = await res.json();
      setCoins(data)
    }
    loadSearch()
  }, [search, setCoins])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? children : (
          <Button
            variant="secondary"
            className={cn(
              "bg-surface text-surface-foreground/60 dark:bg-card relative h-8 w-full justify-start pl-2.5 font-normal shadow-none sm:pr-12 md:w-40 lg:w-56 xl:w-64 cursor-pointer"
            )}
            onClick={() => setOpen(true)}
            {...props}
          >
            <span className="hidden lg:inline-flex text-muted-foreground">Search token or address...</span>
            <span className="inline-flex lg:hidden">Search...</span>
            <div className="absolute top-1.5 right-1.5 hidden gap-1 sm:flex">
              <CommandMenuKbd>{isMac ? "⌘" : "Ctrl"}</CommandMenuKbd>
              <CommandMenuKbd className="aspect-square">K</CommandMenuKbd>
            </div>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="rounded-xl border-none bg-clip-padding p-2 pb-11 shadow-2xl ring-4 ring-neutral-200/80 dark:bg-neutral-900 dark:ring-neutral-800"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Search token or address...</DialogTitle>
          <DialogDescription>Search for a command to run...</DialogDescription>
        </DialogHeader>
        <Command
          className="**:data-[slot=command-input-wrapper]:bg-input/50 **:data-[slot=command-input-wrapper]:border-input rounded-none bg-transparent **:data-[slot=command-input]:!h-9 **:data-[slot=command-input]:py-0 **:data-[slot=command-input-wrapper]:mb-0 **:data-[slot=command-input-wrapper]:!h-9 **:data-[slot=command-input-wrapper]:rounded-md **:data-[slot=command-input-wrapper]:border"
          shouldFilter={false}
        >
          <CommandInput
            placeholder="Search token or address..."
            onKeyDown={(e) => setDebouncedSearch(e.currentTarget.value)}
          />
          <CommandList className="no-scrollbar min-h-80 scroll-pt-2 scroll-pb-1.5 mt-2">
            <CommandEmpty className="text-muted-foreground py-12 text-center text-sm">
              No results found.
            </CommandEmpty>
            {coins.map((coin) => (
              <CommandItem
                key={coin.id}
                value={coin.id}
                className="cursor-pointer flex justify-between mt-2"
                onSelect={() => {
                  setOpen(false)
                  if (onClick) {
                    onClick(coin)
                  }
                  else {
                    router.push('/' + coin.id)
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="rounded-lg w-[30px] h-[30px]">
                    <AvatarImage src={coin.icon} alt={coin.name} width={30} height={30} />
                    <AvatarFallback className="rounded-lg"></AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold flex gap-2 flex items-center">
                      {coin.symbol}
                      <div className="rounded rounded-md bg-background border text-xs font-normal w-max px-2 text-muted-foreground">
                        {coin.id.slice(0, 4)}...{coin.id.slice(-4)}
                      </div>
                      {coin.cexes?.map((cex) => (
                        <div key={cex}>
                          <Image src={`/${getExchangeName(cex)}.png`} width={12} height={12} alt={cex} />
                        </div>
                      ))}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {coin.name}
                    </div>
                  </div>
                </div>
                <div className="text-xs">
                  <div className="flex">
                    <div className="text-muted-foreground mr-[3px]">Liq:</div>
                    <div>{getBigNumber(coin.liquidity)}</div>
                  </div>
                  <div className="flex">
                    <div className="text-muted-foreground mr-[3px]">Mcap:</div>
                    <div>{getBigNumber(coin.mcap)}</div>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandMenuKbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "bg-background text-muted-foreground pointer-events-none flex h-5 items-center justify-center gap-1 rounded border px-1 font-sans text-[0.7rem] font-medium select-none [&_svg:not([class*='size-'])]:size-3",
        className
      )}
      {...props}
    />
  )
}
