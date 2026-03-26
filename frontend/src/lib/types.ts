// ── DealerReach.io TypeScript Types ──

export interface User {
  id: string;
  email: string;
  name: string;
  email_verified: boolean;
  created_at: string;
}

export type RenovationCategory =
  | "kitchen_appliances"
  | "fireplaces"
  | "hot_tubs"
  | "outdoor_kitchens"
  | "countertops"
  | "windows_doors"
  | "other";

export type QuoteRequestStatus =
  | "pending"
  | "searching"
  | "enriching"
  | "sending"
  | "monitoring"
  | "completed"
  | "failed"
  | "archived";

export interface QuoteRequest {
  id: string;
  product_name: string;
  brand: string | null;
  specs: string | null;
  zip_code: string;
  radius_miles: number;
  dealer_locator_url: string | null;
  category: string | null;
  reference_code: string;
  status: QuoteRequestStatus;
  created_at: string;
  updated_at: string;
  dealer_count: number;
  reply_count: number;
}

export interface QuoteRequestDetail {
  id: string;
  product_name: string;
  brand: string | null;
  specs: string | null;
  zip_code: string;
  radius_miles: number;
  dealer_locator_url: string | null;
  category: string | null;
  reference_code: string;
  status: QuoteRequestStatus;
  created_at: string;
  updated_at: string;
  dealers: Dealer[];
  replies: Reply[];
}

export interface Dealer {
  id: string;
  quote_request_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  source: string;
  created_at: string;
}

export type OutreachMethod = "email" | "contact_form";
export type OutreachStatus = "pending" | "sent" | "failed" | "replied";

export interface OutreachRecord {
  id: string;
  dealer_id: string;
  method: OutreachMethod;
  status: OutreachStatus;
  sent_at: string | null;
}

export interface Reply {
  id: string;
  outreach_record_id: string;
  quote_request_id: string;
  dealer_id: string;
  raw_body: string;
  parsed_price: number | null;
  parsed_lead_time: string | null;
  parsed_availability: string | null;
  parsed_summary: string | null;
  received_at: string;
  expires_at: string | null;
  created_at: string;
}

export interface PipelineProgress {
  current_stage: string | null;
  stages_completed: string[];
  dealer_count: number;
  emails_sent: number;
  errors: string[];
}

export type PipelineJobStatus = "queued" | "running" | "completed" | "failed";

export interface PipelineJob {
  id: string;
  quote_request_id: string;
  status: PipelineJobStatus;
  progress: PipelineProgress;
  started_at: string | null;
  completed_at: string | null;
}

export interface CreateQuoteRequestPayload {
  product_name: string;
  brand?: string;
  specs?: string;
  zip_code: string;
  radius_miles?: number;
  dealer_locator_url?: string;
  category?: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}
