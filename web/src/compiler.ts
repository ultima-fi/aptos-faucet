import fetch from "cross-fetch";
import { COMPILER_URL } from "./env";

export async function compile(name: string, address: string) {
  const res = await fetch(COMPILER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, address }),
  });
  const data = await res.json();
  return data["hex"];
}
