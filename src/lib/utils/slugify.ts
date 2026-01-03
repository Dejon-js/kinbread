/**
 * Slug generation utilities
 */

/**
 * Convert a string to a URL-safe slug
 * - Lowercase
 * - Replace spaces and special characters with hyphens
 * - Remove consecutive hyphens
 * - Remove leading/trailing hyphens
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove non-alphanumeric characters (except hyphens)
    .replace(/[^a-z0-9-]/g, '')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '');
}

/**
 * Generate slug suggestions from a business name
 * Returns an array of possible slugs (max 50 characters each)
 */
export function generateSlugSuggestions(businessName: string): string[] {
  const base = slugify(businessName);
  const MAX_SLUG_LENGTH = 50;

  if (!base) {
    return [];
  }

  const allSuggestions = [
    base,
    `${base}-bakery`,
    `${base}-cakes`,
    `${base}-sweets`,
    `${base}1`,
    `${base}2`,
    `${base}3`,
  ];

  // Filter out suggestions that are too long
  const validSuggestions = allSuggestions.filter(
    (slug) => slug.length <= MAX_SLUG_LENGTH
  );

  return validSuggestions.slice(0, 5);
}

/**
 * Validate if a string is a valid slug
 * - Only lowercase letters, numbers, and hyphens
 * - Cannot start or end with hyphen
 * - Max 50 characters
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length > 50) {
    return false;
  }
  // Must be lowercase alphanumeric with hyphens, no leading/trailing hyphens
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(slug);
}
