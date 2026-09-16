import { apiFetch } from "./client";

export function getDashboardSummary() {
  return apiFetch("/dashboard/summary");
}

export function getDashboardTimeline(hours = 24) {
  return apiFetch(`/dashboard/timeline?hours=${hours}`);
}

export function getDashboardLiveEvents(
  limit = 20,
  hours = 24,
  offset = 0,
  search = "",
  verdict = "all"
) {
  const params = new URLSearchParams({
    limit: String(limit),
    hours: String(hours),
    offset: String(offset),
    verdict,
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  return apiFetch(`/dashboard/live-events?${params.toString()}`);
}

export function getDashboardSensors() {
  return apiFetch("/dashboard/sensors");
}
