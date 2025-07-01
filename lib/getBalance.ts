import { Connection, PublicKey } from "@solana/web3.js";
import { RPC_URL } from "./constants";

export async function getBalance(publicKey: PublicKey, connection = new Connection(RPC_URL)) {
  const lamports = await connection.getBalance(publicKey);
  const sol = lamports / 1e9;
  return sol;
}
