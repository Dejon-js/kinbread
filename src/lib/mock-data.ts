import type { Baker, CapacityWindow, Submission } from "@/types";

// Mock data store for frontend development
// This will be replaced with actual Supabase queries when backend is integrated

export const mockBaker: Baker = {
  id: "baker-1",
  user_id: "user-1",
  email: "sarah@sweetdelights.com",
  business_name: "Sweet Delights Bakery",
  slug: "sweet-delights",
  context_message: "Custom cakes and treats for all occasions! Please include details about your event and any dietary requirements.",
  timezone: "America/New_York",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

// Generate dates for the next 30 days
function generateFutureDates(count: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 1; i <= count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
}

const futureDates = generateFutureDates(14);

export const mockCapacityWindows: CapacityWindow[] = [
  {
    id: "window-1",
    baker_id: "baker-1",
    date: futureDates[0],
    total_slots: 3,
    note: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "window-2",
    baker_id: "baker-1",
    date: futureDates[2],
    total_slots: 5,
    note: "Weekend - extra capacity",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "window-3",
    baker_id: "baker-1",
    date: futureDates[4],
    total_slots: 2,
    note: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "window-4",
    baker_id: "baker-1",
    date: futureDates[6],
    total_slots: 4,
    note: "Valentine's prep",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "window-5",
    baker_id: "baker-1",
    date: futureDates[8],
    total_slots: 3,
    note: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

export const mockSubmissions: Submission[] = [
  {
    id: "sub-1",
    baker_id: "baker-1",
    capacity_window_id: "window-1",
    customer_name: "Emily Johnson",
    customer_email: "emily@example.com",
    customer_phone: "555-123-4567",
    description: '6" chocolate cake with buttercream frosting, sage green florals for a birthday party',
    quantity: 1,
    budget_range: "$50-75",
    slots_consumed: 1,
    submitted_at: "2024-01-10T14:30:00Z",
    created_at: "2024-01-10T14:30:00Z",
  },
  {
    id: "sub-2",
    baker_id: "baker-1",
    capacity_window_id: "window-1",
    customer_name: "Michael Chen",
    customer_email: "mchen@example.com",
    customer_phone: null,
    description: "2 dozen assorted cupcakes for office party, nut-free please",
    quantity: 24,
    budget_range: "$60-80",
    slots_consumed: 1,
    submitted_at: "2024-01-10T16:45:00Z",
    created_at: "2024-01-10T16:45:00Z",
  },
  {
    id: "sub-3",
    baker_id: "baker-1",
    capacity_window_id: "window-1",
    customer_name: "Sofia Martinez",
    customer_email: "sofia.m@example.com",
    customer_phone: "555-987-6543",
    description: '8" vanilla bean cake with raspberry filling, white fondant with gold accents for anniversary',
    quantity: 1,
    budget_range: "$100-150",
    slots_consumed: 1,
    submitted_at: "2024-01-11T09:15:00Z",
    created_at: "2024-01-11T09:15:00Z",
  },
  {
    id: "sub-4",
    baker_id: "baker-1",
    capacity_window_id: "window-2",
    customer_name: "David Park",
    customer_email: "dpark@example.com",
    customer_phone: "555-456-7890",
    description: "Wedding cake tasting box - 4 flavors, looking for 3-tier cake for June wedding",
    quantity: 1,
    budget_range: "$300-500",
    slots_consumed: 1,
    submitted_at: "2024-01-12T11:00:00Z",
    created_at: "2024-01-12T11:00:00Z",
  },
  {
    id: "sub-5",
    baker_id: "baker-1",
    capacity_window_id: "window-2",
    customer_name: "Lisa Thompson",
    customer_email: "lisa.t@example.com",
    customer_phone: null,
    description: '10" carrot cake, cream cheese frosting, for Dad\'s 60th birthday',
    quantity: 1,
    budget_range: "$75-100",
    slots_consumed: 1,
    submitted_at: "2024-01-12T14:20:00Z",
    created_at: "2024-01-12T14:20:00Z",
  },
];

// Helper to get current mock state
export function getMockBaker(): Baker | null {
  return mockBaker;
}

export function getMockWindows(): CapacityWindow[] {
  return mockCapacityWindows;
}

export function getMockSubmissions(): Submission[] {
  return mockSubmissions;
}
