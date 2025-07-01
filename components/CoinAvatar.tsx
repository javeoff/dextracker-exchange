import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

export function CoinAvatar({ className, address, width = 24, height = 24 }: {
  className?: string
  address: string;
  width?: number;
  height?: number;
}) {
  const getUrl = () => {
    if (address === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') {
      return 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
    }
    return `https://ipfs.io/ipfs/${address}`
  }
  return (
    <Avatar style={{ width, height }} className={className}>
      <AvatarImage
        src={
          `https://wsrv.nl/?${new URLSearchParams({
            w: String(width),
            h: String(height),
            url: getUrl(),
            dpr: '2',
            quality: '80',
          }).toString()}`
        }
        alt={address}
        width={width}
        height={height}
      />
      <AvatarFallback className="text-[9px]">{address.slice(0, 2)}</AvatarFallback>
    </Avatar>
  )
}
