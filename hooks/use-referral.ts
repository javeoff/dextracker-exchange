import { useWallet } from "@solana/wallet-adapter-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";

export function useReferral() {
  const query = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { publicKey } = useWallet();

  const [ref, setRef] = useState<string | null>(query.get("ref"));

  // 1. При загрузке: сохраняем ref или подставляем из localStorage / API
  useEffect(() => {
    if (!publicKey) return;

    const load = async () => {
      const currentRef = query.get("ref");

      const res = await fetch("https://api.cryptoscan.pro/ref/login", {
        method: "POST",
        body: JSON.stringify({
          address: publicKey.toString(),
          refId: currentRef,
        }),
      });

      const data = await res.json();
      const refIdFromAPI = data.refId;

      if (refIdFromAPI) {
        localStorage.setItem("ref", refIdFromAPI);
      }

      const finalRef = currentRef || localStorage.getItem("ref") || refIdFromAPI;

      if (!currentRef && finalRef) {
        const params = new URLSearchParams(query);
        params.set("ref", finalRef);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }

      if (finalRef) {
        setRef(finalRef);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  // 2. При каждом переходе страницы — проверяем, есть ли ref. Если нет — добавляем.
  useLayoutEffect(() => {
    const currentRef = query.get("ref");
    const storedRef = ref || localStorage.getItem("ref");

    if (!currentRef && storedRef) {
      const params = new URLSearchParams(query);
      params.set("ref", storedRef);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return ref;
}

