import endpoint from "../endpoint";

export async function checkCurrentRoom(userId: string): Promise<any> {
  const baseUrl = process.env.NEXT_PUBLIC_DEV_API_URL;
  if (!baseUrl) {
    throw new Error("API URL is not defined");
  }
  const fullUrl = `${baseUrl}${endpoint.check_current_room}`;
  const apiUrl = new URL(fullUrl);
  apiUrl.searchParams.append("user_id", userId);
  const res = await fetch(apiUrl.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Failed to get song info!");
  const data = await res.json();
  return data;
}