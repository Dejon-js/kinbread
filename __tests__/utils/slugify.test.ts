import { describe, it, expect } from 'vitest';
import { slugify, generateSlugSuggestions } from '@/lib/utils/slugify';

describe('slugify', () => {
  it('should convert text to lowercase', () => {
    expect(slugify('MYBAKERY')).toBe('mybakery');
    expect(slugify('MyBakery')).toBe('mybakery');
  });

  it('should replace spaces with hyphens', () => {
    expect(slugify('my bakery')).toBe('my-bakery');
    expect(slugify('sweet treats bakery')).toBe('sweet-treats-bakery');
  });

  it('should replace underscores with hyphens', () => {
    expect(slugify('my_bakery')).toBe('my-bakery');
  });

  it('should remove special characters', () => {
    expect(slugify("Sarah's Bakery")).toBe('sarahs-bakery');
    expect(slugify('Cake & Co.')).toBe('cake-co');
    expect(slugify('Bake@Home!')).toBe('bakehome');
  });

  it('should remove consecutive hyphens', () => {
    expect(slugify('my  bakery')).toBe('my-bakery');
    expect(slugify('my---bakery')).toBe('my-bakery');
  });

  it('should remove leading and trailing hyphens', () => {
    expect(slugify(' my bakery ')).toBe('my-bakery');
    expect(slugify('-my-bakery-')).toBe('my-bakery');
  });

  it('should handle empty strings', () => {
    expect(slugify('')).toBe('');
    expect(slugify('   ')).toBe('');
  });

  it('should handle numbers', () => {
    expect(slugify('Bakery 123')).toBe('bakery-123');
    expect(slugify('123 Bakery')).toBe('123-bakery');
  });

  it('should handle unicode characters', () => {
    expect(slugify('Café Bakery')).toBe('caf-bakery');
    expect(slugify('Bäckerei')).toBe('bckerei');
  });
});

describe('generateSlugSuggestions', () => {
  it('should generate base slug as first suggestion', () => {
    const suggestions = generateSlugSuggestions('Sweet Treats');
    expect(suggestions[0]).toBe('sweet-treats');
  });

  it('should include variations with -bakes and -bakery', () => {
    const suggestions = generateSlugSuggestions('Sweet');
    expect(suggestions).toContain('sweet');
    expect(suggestions).toContain('sweet-bakes');
    expect(suggestions).toContain('sweet-bakery');
  });

  it('should include numbered variations', () => {
    const suggestions = generateSlugSuggestions('Sweet');
    // Function generates base + -bakes + -bakery + numbered (1, 2, 3), limited to 5 total
    expect(suggestions).toContain('sweet1');
    expect(suggestions).toContain('sweet2');
    // sweet3 may be cut off due to 5-item limit
  });

  it('should return empty array for empty input', () => {
    const suggestions = generateSlugSuggestions('');
    expect(suggestions).toEqual([]);
  });

  it('should return empty array for whitespace-only input', () => {
    const suggestions = generateSlugSuggestions('   ');
    expect(suggestions).toEqual([]);
  });

  it('should return at most 5 suggestions', () => {
    const suggestions = generateSlugSuggestions('Sweet Treats Bakery');
    expect(suggestions.length).toBeLessThanOrEqual(5);
  });

  it('should not add -bakes/-bakery for long slugs', () => {
    const longName = 'This Is A Very Long Business Name';
    const suggestions = generateSlugSuggestions(longName);
    expect(suggestions).not.toContain(`${slugify(longName)}-bakes`);
    expect(suggestions).not.toContain(`${slugify(longName)}-bakery`);
  });
});
