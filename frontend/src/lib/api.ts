import type {
  AuthTokens,
  Client,
  ClientProject,
  CreateClientPayload,
  CreateProductPayload,
  CreateProjectPayload,
  CurationResult,
  Product,
  ProjectProduct,
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
  password: string,
  company_name?: string
): Promise<AuthTokens> {
  const tokens = await fetchApi<AuthTokens>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password, company_name }),
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

export async function updateProfile(data: { name?: string; email?: string; company_name?: string }): Promise<User> {
  return fetchApi<User>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  return fetchApi<void>("/auth/me/change-password", {
    method: "POST",
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}

// ── Products ──

export async function listProducts(): Promise<Product[]> {
  return fetchApi<Product[]>("/products");
}

export async function getProduct(id: string): Promise<Product> {
  return fetchApi<Product>(`/products/${id}`);
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  return fetchApi<Product>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(id: string, payload: Partial<CreateProductPayload>): Promise<Product> {
  return fetchApi<Product>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  return fetchApi<void>(`/products/${id}`, { method: "DELETE" });
}

// ── AI ──

export async function generateAIDescription(productId: string): Promise<{ description: string }> {
  return fetchApi<{ description: string }>(`/ai/describe/${productId}`, {
    method: "POST",
  });
}

export async function curateProducts(query: string, projectId?: string): Promise<CurationResult[]> {
  return fetchApi<CurationResult[]>("/ai/curate", {
    method: "POST",
    body: JSON.stringify({ query, project_id: projectId }),
  });
}

// ── Clients ──

export async function listClients(): Promise<Client[]> {
  return fetchApi<Client[]>("/clients");
}

export async function getClient(id: string): Promise<Client> {
  return fetchApi<Client>(`/clients/${id}`);
}

export async function createClient(payload: CreateClientPayload): Promise<Client> {
  return fetchApi<Client>("/clients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Projects ──

export async function listProjects(clientId?: string): Promise<ClientProject[]> {
  const path = clientId ? `/projects?client_id=${clientId}` : "/projects";
  return fetchApi<ClientProject[]>(path);
}

export async function getProject(id: string): Promise<ClientProject> {
  return fetchApi<ClientProject>(`/projects/${id}`);
}

export async function createProject(payload: CreateProjectPayload): Promise<ClientProject> {
  return fetchApi<ClientProject>("/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function addProductToProject(
  projectId: string,
  productId: string,
  quantity?: number,
  notes?: string
): Promise<ProjectProduct> {
  return fetchApi<ProjectProduct>(`/projects/${projectId}/products`, {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity: quantity ?? 1, notes }),
  });
}

// ── Password Reset ──

export async function forgotPassword(email: string): Promise<void> {
  await fetchApi<void>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, new_password: string): Promise<AuthTokens> {
  const tokens = await fetchApi<AuthTokens>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password }),
  });
  localStorage.setItem("dealerreach_token", tokens.access_token);
  return tokens;
}

// ── Email Verification ──

export async function verifyEmail(token: string): Promise<{ message: string }> {
  return fetchApi<{ message: string }>(`/auth/verify-email?token=${token}`, { method: "POST" });
}

export async function resendVerification(): Promise<void> {
  return fetchApi<void>("/auth/resend-verification", { method: "POST" });
}

export { API_URL, getToken };
