import { apiFetch } from "./client";

export function getDashboardSummary() {
  return apiFetch("/dashboard/summary");
}

export function getDashboardTimeline(hours = 24) {
  return apiFetch(`/dashboard/timeline?hours=${hours}`);
}

export function getDashboardLiveEvents(limit = 20) {
  return apiFetch(`/dashboard/live-events?limit=${limit}`);
}

export function getDashboardSensors() {
  return apiFetch("/dashboard/sensors");
}
