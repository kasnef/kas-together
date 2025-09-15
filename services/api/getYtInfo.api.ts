import endpoint from "../endpoint";

interface Track {
  id: string;
  name: string;
  title: string;
  artist: string;
  url: string;
}

export async function getYtInfo(url: string): Promise<Track> {
  const baseUrl = process.env.NEXT_PUBLIC_DEV_API_URL;
  if (!baseUrl) {
    throw new Error("API URL is not defined");
  }
  const fullUrl = `${baseUrl}${endpoint.get_yt_info}`;
  const apiUrl = new URL(fullUrl);
  apiUrl.searchParams.append("url", url);
  const res = await fetch(apiUrl.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Failed to get song info!");
  const data = await res.json();
  return data;
}
