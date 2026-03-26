// ── DealerReach B2B Dealer Platform TypeScript Types ──

export interface User {
  id: string;
  email: string;
  name: string;
  email_verified: boolean;
  created_at: string;
  company_name?: string;
  company_slug?: string;
  company_logo_url?: string;
  role?: "owner" | "admin" | "member";
  subscription_tier?: "free" | "pro" | "enterprise";
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  model?: string;
  category?: string;
  description?: string;
  ai_description?: string;
  price?: number;
  msrp?: number;
  sku?: string;
  image_urls: string[];
  finish?: string;
  dimensions?: string;
  specifications?: Record<string, string>;
  in_stock: boolean;
  showroom_location?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  notes?: string;
  portal_enabled: boolean;
  portal_slug?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientProject {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  status: "draft" | "active" | "review" | "approved" | "completed";
  mood_board_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface ProjectProduct {
  id: string;
  project_id: string;
  product_id: string;
  product?: Product;
  notes?: string;
  quantity: number;
  approved: boolean;
  added_at: string;
}

export interface CurationResult {
  product_id: string;
  product: Product;
  relevance_score: number;
  reasoning: string;
}

export interface CreateProductPayload {
  name: string;
  brand: string;
  model?: string;
  category?: string;
  description?: string;
  price?: number;
  msrp?: number;
  sku?: string;
  image_urls?: string[];
  finish?: string;
  dimensions?: string;
  specifications?: Record<string, string>;
  in_stock?: boolean;
  showroom_location?: string;
  tags?: string[];
}

export interface CreateClientPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  notes?: string;
  portal_enabled?: boolean;
}

export interface CreateProjectPayload {
  client_id: string;
  name: string;
  description?: string;
  mood_board_urls?: string[];
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}
