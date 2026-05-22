const API_BASE = "http://139.84.172.22:8000";

export async function lookupIp(ip) {
  const response = await fetch(`${API_BASE}/lookup/${ip}`);

  if (!response.ok) {
    throw new Error("IP not found");
  }

  return response.json();
}
