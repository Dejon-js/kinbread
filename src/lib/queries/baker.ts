import { mockBaker } from "@/lib/mock-data";
import type { Baker, PublicBakerView } from "@/types";

export async function getBakerByUserId(userId: string): Promise<Baker | null> {
  // TODO: Replace with actual Supabase query
  // For now, return mock data

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (userId === "user-1") {
    return mockBaker;
  }

  return null;
}

export async function getBakerBySlug(slug: string): Promise<PublicBakerView | null> {
  // TODO: Replace with actual Supabase query
  // For now, return mock data

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (slug === "sweet-delights") {
    return {
      id: mockBaker.id,
      business_name: mockBaker.business_name,
      slug: mockBaker.slug,
      context_message: mockBaker.context_message,
      timezone: mockBaker.timezone,
    };
  }

  return null;
}

export async function getCurrentBaker(): Promise<Baker | null> {
  // TODO: Replace with actual auth check and Supabase query
  // For now, return mock data (simulating logged in user)

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return mockBaker;
}
