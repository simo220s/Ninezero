import { describe, it, expect } from 'vitest';
import { sanitizeInput, sanitizeEmail, sanitizeName } from '../../../src/utils/sanitization';

describe('Sanitization Utils', () => {
  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeInput(input);
      
      expect(result).toBe('Hello');
      expect(result).not.toContain('<script>');
    });

    it('should remove dangerous characters', () => {
      const input = 'Hello<>World';
      const result = sanitizeInput(input);
      
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const result = sanitizeInput(input);
      
      expect(result).toBe('Hello World');
    });

    it('should handle empty strings', () => {
      const result = sanitizeInput('');
      expect(result).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    it('should convert email to lowercase', () => {
      const email = 'Test@Example.COM';
      const result = sanitizeEmail(email);
      
      expect(result).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      const email = '  test@example.com  ';
      const result = sanitizeEmail(email);
      
      expect(result).toBe('test@example.com');
    });

    it('should remove invalid characters', () => {
      const email = 'test<script>@example.com';
      const result = sanitizeEmail(email);
      
      expect(result).not.toContain('<script>');
    });
  });

  describe('sanitizeName', () => {
    it('should preserve valid names', () => {
      const name = 'John Doe';
      const result = sanitizeName(name);
      
      expect(result).toBe('John Doe');
    });

    it('should preserve Arabic names', () => {
      const name = 'محمد أحمد';
      const result = sanitizeName(name);
      
      expect(result).toBe('محمد أحمد');
    });

    it('should remove HTML tags from names', () => {
      const name = '<b>John</b> Doe';
      const result = sanitizeName(name);
      
      expect(result).not.toContain('<b>');
      expect(result).not.toContain('</b>');
    });

    it('should trim whitespace', () => {
      const name = '  John Doe  ';
      const result = sanitizeName(name);
      
      expect(result).toBe('John Doe');
    });
  });
});
