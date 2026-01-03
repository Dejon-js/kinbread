export interface OnboardingFormData {
  business_name: string;
  slug: string;
  timezone: string;
}

export interface SettingsFormData {
  business_name: string;
  context_message?: string | null;
  timezone: string;
}

export interface CapacityWindowFormData {
  date: string;
  total_slots: number;
  note?: string | null;
}

export interface SubmissionFormData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  description: string;
  quantity?: number | null;
  budget_range?: string | null;
}
