export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export type AuthActionResult =
  | { success: true; userId?: string }
  | { success: false; error: string };
