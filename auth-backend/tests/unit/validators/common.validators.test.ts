import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  nameSchema,
  phoneSchema,
  uuidSchema,
  paginationSchema
} from '../../../src/validators/common.validators';

describe('Common Validators', () => {
  describe('emailSchema', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.com'
      ];

      validEmails.forEach(email => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        ''
      ];

      invalidEmails.forEach(email => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('passwordSchema', () => {
    it('should validate strong passwords', () => {
      const validPasswords = [
        'StrongPass123!',
        'MyP@ssw0rd',
        'Secure#Pass1'
      ];

      validPasswords.forEach(password => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(true);
      });
    });

    it('should reject weak passwords', () => {
      const invalidPasswords = [
        'short',           // Too short
        'nouppercase1!',   // No uppercase
        'NOLOWERCASE1!',   // No lowercase
        'NoNumbers!',      // No numbers
        'NoSpecial123'     // No special chars
      ];

      invalidPasswords.forEach(password => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('nameSchema', () => {
    it('should validate correct names', () => {
      const validNames = [
        'John Doe',
        'محمد أحمد',
        'Jean-Pierre',
        'O\'Brien'
      ];

      validNames.forEach(name => {
        const result = nameSchema.safeParse(name);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid names', () => {
      const invalidNames = [
        'A',              // Too short
        '',               // Empty
        '123',            // Only numbers
        '<script>alert</script>' // HTML
      ];

      invalidNames.forEach(name => {
        const result = nameSchema.safeParse(name);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('phoneSchema', () => {
    it('should validate correct phone numbers', () => {
      const validPhones = [
        '+966501234567',
        '+1234567890',
        '+447911123456'
      ];

      validPhones.forEach(phone => {
        const result = phoneSchema.safeParse(phone);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '123',            // Too short
        'notaphone',      // Not a number
        '+12',            // Too short
        ''                // Empty
      ];

      invalidPhones.forEach(phone => {
        const result = phoneSchema.safeParse(phone);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('uuidSchema', () => {
    it('should validate correct UUIDs', () => {
      const validUuids = [
        '123e4567-e89b-12d3-a456-426614174000',
        '550e8400-e29b-41d4-a716-446655440000'
      ];

      validUuids.forEach(uuid => {
        const result = uuidSchema.safeParse(uuid);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid UUIDs', () => {
      const invalidUuids = [
        'not-a-uuid',
        '123',
        '',
        '123e4567-e89b-12d3-a456' // Incomplete
      ];

      invalidUuids.forEach(uuid => {
        const result = uuidSchema.safeParse(uuid);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('paginationSchema', () => {
    it('should validate correct pagination params', () => {
      const validParams = [
        { page: 1, limit: 10 },
        { page: 5, limit: 50 },
        { page: 1, limit: 100 }
      ];

      validParams.forEach(params => {
        const result = paginationSchema.safeParse(params);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid pagination params', () => {
      const invalidParams = [
        { page: 0, limit: 10 },    // Page < 1
        { page: 1, limit: 0 },     // Limit < 1
        { page: 1, limit: 101 },   // Limit > 100
        { page: -1, limit: 10 }    // Negative page
      ];

      invalidParams.forEach(params => {
        const result = paginationSchema.safeParse(params);
        expect(result.success).toBe(false);
      });
    });

    it('should use default values', () => {
      const result = paginationSchema.parse({});
      
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });
});
