import { describe, it, expect } from 'vitest';
import { slugify, generateSlugSuggestions, isValidSlug } from './slugify';

describe('slugify utility functions', () => {
  describe('slugify', () => {
    it('converts text to lowercase', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('UPPERCASE')).toBe('uppercase');
    });

    it('replaces spaces with hyphens', () => {
      expect(slugify('hello world')).toBe('hello-world');
      expect(slugify('multiple   spaces')).toBe('multiple-spaces');
    });

    it('removes special characters', () => {
      expect(slugify("Sarah's Bakery")).toBe('sarahs-bakery');
      expect(slugify('Hello! World?')).toBe('hello-world');
      expect(slugify('Sweet & Delicious')).toBe('sweet-delicious');
    });

    it('replaces underscores with hyphens', () => {
      expect(slugify('hello_world')).toBe('hello-world');
    });

    it('removes leading and trailing hyphens', () => {
      expect(slugify('-hello-')).toBe('hello');
      expect(slugify('---test---')).toBe('test');
    });

    it('handles empty strings', () => {
      expect(slugify('')).toBe('');
    });

    it('handles strings with only special characters', () => {
      expect(slugify('!@#$%')).toBe('');
    });

    it('preserves numbers', () => {
      expect(slugify('Bakery 123')).toBe('bakery-123');
      expect(slugify('2024 Cakes')).toBe('2024-cakes');
    });
  });

  describe('generateSlugSuggestions', () => {
    it('generates slug suggestions from a business name', () => {
      const suggestions = generateSlugSuggestions('Sweet Delights');
      expect(suggestions).toContain('sweet-delights');
      expect(suggestions).toContain('sweet-delights-bakery');
      expect(suggestions).toContain('sweet-delights-cakes');
      expect(suggestions).toContain('sweet-delights-sweets');
    });

    it('returns empty array for empty string', () => {
      expect(generateSlugSuggestions('')).toEqual([]);
    });

    it('returns empty array for strings with only special characters', () => {
      expect(generateSlugSuggestions('!@#$%')).toEqual([]);
    });

    it('filters out suggestions that are too long', () => {
      const veryLongName = 'A'.repeat(60);
      const suggestions = generateSlugSuggestions(veryLongName);
      suggestions.forEach((slug) => {
        expect(slug.length).toBeLessThanOrEqual(50);
      });
    });
  });

  describe('isValidSlug', () => {
    it('returns true for valid slugs', () => {
      expect(isValidSlug('hello')).toBe(true);
      expect(isValidSlug('hello-world')).toBe(true);
      expect(isValidSlug('sweet-delights-bakery')).toBe(true);
      expect(isValidSlug('a')).toBe(true);
      expect(isValidSlug('123')).toBe(true);
      expect(isValidSlug('abc123')).toBe(true);
    });

    it('returns false for empty strings', () => {
      expect(isValidSlug('')).toBe(false);
    });

    it('returns false for slugs with uppercase letters', () => {
      expect(isValidSlug('Hello')).toBe(false);
      expect(isValidSlug('HELLO')).toBe(false);
    });

    it('returns false for slugs with special characters', () => {
      expect(isValidSlug('hello_world')).toBe(false);
      expect(isValidSlug('hello.world')).toBe(false);
      expect(isValidSlug("sarah's")).toBe(false);
    });

    it('returns false for slugs starting with hyphen', () => {
      expect(isValidSlug('-hello')).toBe(false);
    });

    it('returns false for slugs ending with hyphen', () => {
      expect(isValidSlug('hello-')).toBe(false);
    });

    it('returns false for slugs longer than 50 characters', () => {
      const longSlug = 'a'.repeat(51);
      expect(isValidSlug(longSlug)).toBe(false);
    });

    it('returns true for slugs exactly 50 characters', () => {
      const maxSlug = 'a'.repeat(50);
      expect(isValidSlug(maxSlug)).toBe(true);
    });
  });
});
