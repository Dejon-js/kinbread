/**
 * Convert a string to a URL-safe slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generate slug suggestions from a business name
 */
export function generateSlugSuggestions(businessName: string): string[] {
  const base = slugify(businessName);
  if (!base) return [];

  return [
    base,
    `${base}-bakery`,
    `${base}-cakes`,
    `${base}-sweets`,
  ].filter((slug) => slug.length >= 1 && slug.length <= 50);
}

/**
 * Validate a slug format
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length > 50) return false;
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(slug);
}
