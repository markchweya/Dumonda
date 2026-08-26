import { randomBytes } from "node:crypto";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

/** URL-safe random id, e.g. "ev_k3j9x2m4p8q1" */
export function newId(prefix: string): string {
  const bytes = randomBytes(16);
  let out = "";
  for (let i = 0; i < 14; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return `${prefix}_${out}`;
}
