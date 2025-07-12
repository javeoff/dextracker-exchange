import { formatTimeDifference } from "@/lib/utils";
import { useState, useEffect } from "react";

type Props = {
  targetDate: Date;
};

export function RewardCountdown({ targetDate }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <span>{formatTimeDifference(targetDate, now)}</span>;
}

