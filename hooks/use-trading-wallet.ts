import { useState, useCallback, useEffect } from "react";
import { Keypair, Transaction } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

const STORAGE_KEY = "encrypted_trading_wallet";
const SIGN_MESSAGE = "trading wallet encryption";
const IV_LENGTH = 12;

function generateIV() {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

async function deriveKey(signature: Uint8Array): Promise<CryptoKey> {
  const hash = await crypto.subtle.digest("SHA-256", signature);
  return crypto.subtle.importKey("raw", hash, "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function encryptSecretKey(secretKey: Uint8Array, key: CryptoKey) {
  const iv = generateIV();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    secretKey
  );
  return {
    iv: Array.from(iv),
    ciphertext: Array.from(new Uint8Array(ciphertext)),
  };
}

let globalWallet: Keypair | null = null;
const listeners = new Set<() => void>();

function setGlobalWallet(wallet: Keypair | null) {
  globalWallet = wallet;
  listeners.forEach((listener) => listener());
}

export function useTradingWallet() {
  const { signMessage, publicKey } = useWallet();
  const [wallet, setWallet] = useState<Keypair | null>(null);

  useEffect(() => {
    const listener = () => setWallet(globalWallet);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const createAndStoreWallet = useCallback(async () => {
    if (!publicKey || !signMessage) {
      return;
    }
    const tempWallet = Keypair.generate();
    const secretKey = tempWallet.secretKey;
    const signature = await signMessage(new TextEncoder().encode(SIGN_MESSAGE));
    const key = await deriveKey(signature);
    const payload = await encryptSecretKey(secretKey, key);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setGlobalWallet(tempWallet);
    setWallet(tempWallet);
    return tempWallet;
  }, [publicKey, signMessage]);

  const login = useCallback(async () => {
    console.log('public', publicKey, signMessage)
    if (!signMessage || !publicKey) {
      return;
    }

    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) {
      return createAndStoreWallet();
    }

    let parsed;
    try {
      parsed = JSON.parse(encrypted);
    } catch {
      throw new Error("Invalid wallet data in storage");
    }

    if ("iv" in parsed && "ciphertext" in parsed) {
      const iv = new Uint8Array(parsed.iv);
      const ciphertext = new Uint8Array(parsed.ciphertext);
      try {
        const signature = await signMessage(new TextEncoder().encode(SIGN_MESSAGE));
        const key = await deriveKey(signature);
        const decrypted = await crypto.subtle.decrypt(
          { name: "AES-GCM", iv },
          key,
          ciphertext.buffer
        );
        const keypair = Keypair.fromSecretKey(new Uint8Array(decrypted));
        setWallet(keypair);
        setGlobalWallet(keypair);
        return keypair;
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
        return createAndStoreWallet();
      }
    } else {
      throw new Error("Invalid wallet format");
    }
  }, [signMessage, publicKey, createAndStoreWallet]);

  const getWallet = useCallback(() => wallet, [wallet]);

  const sign = useCallback(
    async (tx: Transaction) => {
      if (!wallet) throw new Error("Trading wallet not loaded. Call login first.");
      tx.partialSign(wallet);
      return tx;
    },
    [wallet]
  );

  return {
    login,
    getWallet,
    sign,
  };
}
