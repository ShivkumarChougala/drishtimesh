import { apiFetch } from "./client";

export function getHealth() {
  return apiFetch("/health");
}

export function getNetworkStats() {
  return apiFetch("/network/stats");
}

export function getRecentFeed() {
  return apiFetch("/feed/recent");
}

export function registerNode(payload = {}) {
  return apiFetch("/nodes/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
