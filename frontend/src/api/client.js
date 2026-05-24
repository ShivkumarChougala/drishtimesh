const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://139.84.172.22:8000";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("drishti_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.json();
}
