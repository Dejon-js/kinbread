import { mockCapacityWindows, mockSubmissions } from "@/lib/mock-data";
import { getTodayString } from "@/lib/utils/dates";
import type { CapacityWindow, WindowWithStats, WindowWithSubmissions, PublicWindowView } from "@/types";

export async function getWindowsForBaker(bakerId: string): Promise<WindowWithStats[]> {
  // TODO: Replace with actual Supabase query
  // For now, return mock data with computed stats

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const windows = mockCapacityWindows.filter((w) => w.baker_id === bakerId);

  return windows.map((window) => {
    const submissions = mockSubmissions.filter(
      (s) => s.capacity_window_id === window.id
    );
    const usedSlots = submissions.reduce((sum, s) => sum + s.slots_consumed, 0);

    return {
      ...window,
      used_slots: usedSlots,
      available_slots: window.total_slots - usedSlots,
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
}

export async function getWindowWithSubmissions(
  windowId: string,
  bakerId: string
): Promise<WindowWithSubmissions | null> {
  // TODO: Replace with actual Supabase query
  // For now, return mock data

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const window = mockCapacityWindows.find(
    (w) => w.id === windowId && w.baker_id === bakerId
  );

  if (!window) return null;

  const submissions = mockSubmissions.filter(
    (s) => s.capacity_window_id === windowId
  );
  const usedSlots = submissions.reduce((sum, s) => sum + s.slots_consumed, 0);

  return {
    ...window,
    used_slots: usedSlots,
    available_slots: window.total_slots - usedSlots,
    submissions: submissions.sort(
      (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    ),
  };
}

export async function getPublicWindowsForBaker(
  bakerId: string,
  timezone: string = "America/New_York"
): Promise<PublicWindowView[]> {
  // TODO: Replace with actual Supabase query
  // For now, return mock data filtered to future dates only

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const today = getTodayString(timezone);
  const windows = mockCapacityWindows.filter(
    (w) => w.baker_id === bakerId && w.date >= today
  );

  return windows
    .map((window) => {
      const submissions = mockSubmissions.filter(
        (s) => s.capacity_window_id === window.id
      );
      const usedSlots = submissions.reduce((sum, s) => sum + s.slots_consumed, 0);
      const availableSlots = window.total_slots - usedSlots;

      return {
        id: window.id,
        date: window.date,
        available_slots: availableSlots,
        is_available: availableSlots > 0,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getWindowById(windowId: string): Promise<CapacityWindow | null> {
  // TODO: Replace with actual Supabase query
  // For now, return mock data

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return mockCapacityWindows.find((w) => w.id === windowId) || null;
}

export async function getWindowForBooking(
  windowId: string,
  bakerId: string
): Promise<{ window: CapacityWindow; available: boolean } | null> {
  // TODO: Replace with actual Supabase query
  // For now, return mock data

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const window = mockCapacityWindows.find(
    (w) => w.id === windowId && w.baker_id === bakerId
  );

  if (!window) return null;

  const submissions = mockSubmissions.filter(
    (s) => s.capacity_window_id === windowId
  );
  const usedSlots = submissions.reduce((sum, s) => sum + s.slots_consumed, 0);

  return {
    window,
    available: usedSlots < window.total_slots,
  };
}
