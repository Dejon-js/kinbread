import type { CapacityWindow, Submission } from "./database";

export interface WindowWithStats extends CapacityWindow {
  used_slots: number;
  available_slots: number;
}

export interface WindowWithSubmissions extends WindowWithStats {
  submissions: Submission[];
}

export interface PublicWindowView {
  id: string;
  date: string;
  available_slots: number;
  is_available: boolean;
}

export interface PublicBakerView {
  id: string;
  business_name: string;
  slug: string;
  context_message: string | null;
  timezone: string;
}
