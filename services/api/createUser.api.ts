import { Helper } from "@/utils/helper";
import endpoint from "../endpoint";

export async function generateUser(username: string) {
  const userLocalTime = Helper.getNowTz();
  const res = await fetch(`${process.env.NEXT_PUBLIC_DEV_API_URL}${endpoint.gen_user}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, userLocalTime }),
  });

  if (!res.ok) throw new Error("Failed to create user!");
  const data = await res.json();
  return data;
}
