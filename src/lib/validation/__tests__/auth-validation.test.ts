import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  loginSchema,
  signupPasswordSchema,
} from '../auth-validation';

describe('Auth Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'saudienglis.hclub@gmail.com',
        'teacher123@school.edu',
      ];

      validEmails.forEach((email) => {
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
        '',
      ];

      invalidEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
      });
    });

    it('should trim and lowercase email addresses', () => {
      const result = emailSchema.parse('  TEST@EXAMPLE.COM  ');
      expect(result).toBe('test@example.com');
    });

    it('should show Arabic error message for invalid email', () => {
      const result = emailSchema.safeParse('invalid');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('البريد الإلكتروني غير صحيح');
      }
    });

    it('should show Arabic error message for empty email', () => {
      const result = emailSchema.safeParse('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('البريد الإلكتروني مطلوب');
      }
    });
  });

  describe('passwordSchema', () => {
    it('should accept any non-empty password', () => {
      const validPasswords = ['1', '123456', 'short', 'verylongpassword123!@#'];

      validPasswords.forEach((password) => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(true);
      });
    });

    it('should reject empty password', () => {
      const result = passwordSchema.safeParse('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('كلمة المرور مطلوبة');
      }
    });
  });

  describe('signupPasswordSchema', () => {
    it('should accept passwords with 6 or more characters', () => {
      const validPasswords = ['123456', 'password', 'verylongpassword'];

      validPasswords.forEach((password) => {
        const result = signupPasswordSchema.safeParse(password);
        expect(result.success).toBe(true);
      });
    });

    it('should reject passwords with less than 6 characters', () => {
      const invalidPasswords = ['12345', 'short', 'abc'];

      invalidPasswords.forEach((password) => {
        const result = signupPasswordSchema.safeParse(password);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login credentials', () => {
      const validData = {
        email: 'saudienglis.hclub@gmail.com',
        password: 'password123',
        rememberMe: true,
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept login without rememberMe', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email in login', () => {
      const invalidData = {
        email: 'notanemail',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty password in login', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should process email with proper formatting', () => {
      const data = {
        email: '  TEACHER@SCHOOL.COM  ',
        password: 'password123',
      };

      const result = loginSchema.parse(data);
      expect(result.email).toBe('teacher@school.com');
    });
  });
});
