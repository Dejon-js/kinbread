/**
 * Server Action result types
 */

/**
 * Generic action result type
 * @template T - The data type returned on success
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Action result with validation errors
 */
export type ActionResultWithValidation<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string; validationErrors?: ValidationError[] };
