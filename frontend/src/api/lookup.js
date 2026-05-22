import { apiFetch } from "./client";

export function lookupIp(ip) {
  return apiFetch(`/lookup/${encodeURIComponent(ip)}`);
}
