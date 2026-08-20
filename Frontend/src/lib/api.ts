const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("axiom_access_token") : null;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // If unauthorized, clear tokens and redirect to login
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem("axiom_access_token");
      localStorage.removeItem("axiom_user");
      window.location.href = "/login";
    }
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  return data;
}
