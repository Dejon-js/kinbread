import { mockSubmissions } from "@/lib/mock-data";
import type { Submission } from "@/types";

export async function getSubmissionsForWindow(
  windowId: string
): Promise<Submission[]> {
  // TODO: Replace with actual Supabase query
  // For now, return mock data

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return mockSubmissions
    .filter((s) => s.capacity_window_id === windowId)
    .sort(
      (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );
}

export async function getSubmissionById(
  submissionId: string
): Promise<Submission | null> {
  // TODO: Replace with actual Supabase query
  // For now, return mock data

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return mockSubmissions.find((s) => s.id === submissionId) || null;
}
