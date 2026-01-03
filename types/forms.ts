/**
 * Form data types for user input
 */

/**
 * Onboarding form data (initial baker setup)
 */
export interface OnboardingFormData {
  business_name: string;
  slug: string;
  timezone: string;
}

/**
 * Baker settings update form data
 */
export interface SettingsFormData {
  business_name: string;
  context_message?: string | null;
  timezone: string;
}

/**
 * Capacity window creation/update form data
 */
export interface CapacityWindowFormData {
  date: string;
  total_slots: number;
  note?: string | null;
}

/**
 * Customer submission form data
 */
export interface SubmissionFormData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  description: string;
  quantity?: number | null;
  budget_range?: string | null;
}
