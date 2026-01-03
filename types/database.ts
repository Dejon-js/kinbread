/**
 * Database types that match the Supabase schema exactly
 */

export interface Baker {
  id: string;
  user_id: string;
  email: string;
  business_name: string;
  slug: string;
  context_message: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface CapacityWindow {
  id: string;
  baker_id: string;
  date: string; // ISO date string YYYY-MM-DD
  total_slots: number;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  baker_id: string;
  capacity_window_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  description: string;
  quantity: number | null;
  budget_range: string | null;
  slots_consumed: number;
  submitted_at: string;
  created_at: string;
}

/**
 * Database function return types
 */
export interface CreateSubmissionResult {
  success: boolean;
  submission_id: string | null;
  error_code: string | null;
}
