import type {
  AuthTokens,
  CreateQuoteRequestPayload,
  Dealer,
  QuoteRequest,
  QuoteRequestDetail,
  Reply,
  User,
} from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("dealerreach_token");
}

function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("dealerreach_token");
}

async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

// ── Auth ──

export async function signup(
  name: string,
  email: string,
  password: string
): Promise<AuthTokens> {
  const tokens = await fetchApi<AuthTokens>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  localStorage.setItem("dealerreach_token", tokens.access_token);
  return tokens;
}

export async function login(
  email: string,
  password: string
): Promise<AuthTokens> {
  const tokens = await fetchApi<AuthTokens>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("dealerreach_token", tokens.access_token);
  return tokens;
}

export async function getMe(): Promise<User> {
  return fetchApi<User>("/auth/me");
}

// ── Quote Requests ──

export async function createQuoteRequest(
  payload: CreateQuoteRequestPayload
): Promise<QuoteRequest> {
  return fetchApi<QuoteRequest>("/quote-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listQuoteRequests(): Promise<QuoteRequest[]> {
  return fetchApi<QuoteRequest[]>("/quote-requests");
}

export async function getQuoteRequest(id: string): Promise<QuoteRequestDetail> {
  return fetchApi<QuoteRequestDetail>(`/quote-requests/${id}`);
}

export async function archiveQuoteRequest(id: string): Promise<QuoteRequest> {
  return fetchApi<QuoteRequest>(`/quote-requests/${id}/archive`, { method: "PATCH" });
}

export async function deleteQuoteRequest(id: string): Promise<void> {
  return fetchApi<void>(`/quote-requests/${id}`, { method: "DELETE" });
}

// ── Dealers ──

export async function getDealers(quoteRequestId: string): Promise<Dealer[]> {
  return fetchApi<Dealer[]>(`/quote-requests/${quoteRequestId}/dealers`);
}

// ── Replies ──

export async function getReplies(quoteRequestId: string): Promise<Reply[]> {
  return fetchApi<Reply[]>(`/quote-requests/${quoteRequestId}/replies`);
}

export { API_URL, getToken };
