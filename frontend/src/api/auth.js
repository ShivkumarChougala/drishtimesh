import { apiFetch } from "./client";

export function login(payload) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function signup(payload) {
  return apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMe() {
  const token = localStorage.getItem("drishti_token");
  return apiFetch("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function saveAuth(data) {
  localStorage.setItem("drishti_token", data.access_token);
  localStorage.setItem("drishti_user", JSON.stringify(data.user));
}

export function logout() {
  localStorage.removeItem("drishti_token");
  localStorage.removeItem("drishti_user");
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem("drishti_token"));
}
