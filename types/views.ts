/**
 * Derived/view types for UI consumption
 */

import type { CapacityWindow, Submission } from './database';

/**
 * Capacity window with computed slot statistics
 */
export interface WindowWithStats extends CapacityWindow {
  used_slots: number;
  available_slots: number;
}

/**
 * Capacity window with its submissions and stats
 */
export interface WindowWithSubmissions extends WindowWithStats {
  submissions: Submission[];
}

/**
 * Public-facing window view (no sensitive data)
 */
export interface PublicWindowView {
  id: string;
  date: string;
  available_slots: number;
  is_available: boolean;
}

/**
 * Public-facing baker view (no sensitive data)
 */
export interface PublicBakerView {
  id: string;
  business_name: string;
  slug: string;
  context_message: string | null;
  timezone: string;
}
