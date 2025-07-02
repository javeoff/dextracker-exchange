import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

export function CoinAvatar({ className, address, width = 24, height = 24 }: {
  className?: string
  address: string;
  width?: number;
  height?: number;
}) {
  if (!address) {
    return null;
  }
  return (
    <Avatar style={{ width, height }} className={cn("z-0", className)}>
      <AvatarImage
        src={`https://api.cryptoscan.pro/image/${address}`}
        alt={address}
        width={width}
        height={height}
      />
      <AvatarFallback className="text-[9px]">{address.slice(0, 2)}</AvatarFallback>
    </Avatar>
  )
}
