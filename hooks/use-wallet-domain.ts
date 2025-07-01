import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { reverseLookup, getAllDomains } from '@bonfida/spl-name-service';
import { connection } from "@/lib/constants";

export function useWalletDomain(walletPubkey?: PublicKey) {
  const [domain, setDomain] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!walletPubkey) {
      setDomain(null);
      return;
    }

    setLoading(true);
    setError(null);

    async function fetchDomain() {
      if (!walletPubkey) {
        return
      }
      try {
        const name = await reverseLookup(connection, walletPubkey);
        if (name) {
          setDomain(name);
          return;
        }
      } catch { }

      try {
        const ownedDomains = await getAllDomains(connection, walletPubkey);
        if (ownedDomains && ownedDomains.length > 0) {
          const name = await reverseLookup(connection, ownedDomains[0]);
          setDomain(name);
          return;
        }

        setDomain(null);
      } catch (err) {
        console.warn('Error fetching wallet domain:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setDomain(null);
      } finally {
        setLoading(false);
      }
    }

    fetchDomain();
  }, [walletPubkey]);
  console.log(domain, error)

  return { domain, loading, error };
}
