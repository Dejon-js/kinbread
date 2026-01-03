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
 * Returns an array of possible slugs
 */
export function generateSlugSuggestions(businessName: string): string[] {
  const base = slugify(businessName);

  if (!base) {
    return [];
  }

  const suggestions = [base];

  // Add some variations
  if (base.length <= 20) {
    suggestions.push(`${base}-bakes`);
    suggestions.push(`${base}-bakery`);
  }

  // Add number suffix variations
  for (let i = 1; i <= 3; i++) {
    suggestions.push(`${base}${i}`);
  }

  return suggestions.slice(0, 5);
}
