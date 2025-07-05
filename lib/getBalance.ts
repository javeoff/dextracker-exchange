import { Connection, PublicKey } from "@solana/web3.js";
import { RPC_URL } from "./constants";

export async function getBalance(publicKey: PublicKey, connection = new Connection(RPC_URL)) {
  try {
  const lamports = await connection.getBalance(publicKey);
  if (!lamports) {
    return 0
  }
  const sol = lamports / 1e9;
  return sol;
  } catch {
    return 0;
  }
}
