/**
 * Backend Environment Configuration Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Backend Environment Configuration', () => {
  // Store original environment
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('validateEnv', () => {
    it('should validate successfully with all required variables', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      process.env.JWT_SECRET = 'a-very-long-secret-key-that-is-at-least-32-characters-long';

      // Clear module cache to get fresh import
      delete require.cache[require.resolve('../env')];
      const { validateEnv } = require('../env');

      expect(() => validateEnv()).not.toThrow();
      const config = validateEnv();

      expect(config.supabase.url).toBe('https://test.supabase.co');
      expect(config.jwt.secret).toBe('a-very-long-secret-key-that-is-at-least-32-characters-long');
    });

    it('should throw error when SUPABASE_URL is missing', () => {
      delete process.env.SUPABASE_URL;
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      process.env.JWT_SECRET = 'a-very-long-secret-key-that-is-at-least-32-characters-long';

      delete require.cache[require.resolve('../env')];
      const { validateEnv } = require('../env');

      expect(() => validateEnv()).toThrow(/SUPABASE_URL is required/);
    });

    it('should throw error when JWT_SECRET is too short', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      process.env.JWT_SECRET = 'short';

      delete require.cache[require.resolve('../env')];
      const { validateEnv } = require('../env');

      expect(() => validateEnv()).toThrow(/JWT_SECRET must be at least 32 characters/);
    });

    it('should throw error when SUPABASE_URL is invalid', () => {
      process.env.SUPABASE_URL = 'not-a-valid-url';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      process.env.JWT_SECRET = 'a-very-long-secret-key-that-is-at-least-32-characters-long';

      delete require.cache[require.resolve('../env')];
      const { validateEnv } = require('../env');

      expect(() => validateEnv()).toThrow(/SUPABASE_URL must be a valid Supabase URL/);
    });

    it('should throw error when PORT is invalid', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      process.env.JWT_SECRET = 'a-very-long-secret-key-that-is-at-least-32-characters-long';
      process.env.PORT = 'invalid';

      delete require.cache[require.resolve('../env')];
      const { validateEnv } = require('../env');

      expect(() => validateEnv()).toThrow(/PORT must be a valid number/);
    });

    it('should use default values for optional variables', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      process.env.JWT_SECRET = 'a-very-long-secret-key-that-is-at-least-32-characters-long';
      delete process.env.PORT;
      delete process.env.NODE_ENV;

      delete require.cache[require.resolve('../env')];
      const { validateEnv } = require('../env');

      const config = validateEnv();

      expect(config.port).toBe(3000);
      expect(config.nodeEnv).toBe('development');
      expect(config.jwt.accessExpiration).toBe('15m');
      expect(config.jwt.refreshExpiration).toBe('7d');
    });
  });

  describe('getMissingVariables', () => {
    it('should return empty array when all required variables are present', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      process.env.JWT_SECRET = 'a-very-long-secret-key-that-is-at-least-32-characters-long';

      delete require.cache[require.resolve('../env')];
      const { getMissingVariables } = require('../env');

      expect(getMissingVariables()).toHaveLength(0);
    });

    it('should return missing variable names', () => {
      delete process.env.SUPABASE_URL;
      delete process.env.JWT_SECRET;

      delete require.cache[require.resolve('../env')];
      const { getMissingVariables } = require('../env');

      const missing = getMissingVariables();
      expect(missing).toContain('SUPABASE_URL');
      expect(missing).toContain('JWT_SECRET');
    });
  });

  describe('isEnvironmentConfigured', () => {
    it('should return true when all required variables are present', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      process.env.JWT_SECRET = 'a-very-long-secret-key-that-is-at-least-32-characters-long';

      delete require.cache[require.resolve('../env')];
      const { isEnvironmentConfigured } = require('../env');

      expect(isEnvironmentConfigured()).toBe(true);
    });

    it('should return false when required variables are missing', () => {
      delete process.env.SUPABASE_URL;

      delete require.cache[require.resolve('../env')];
      const { isEnvironmentConfigured } = require('../env');

      expect(isEnvironmentConfigured()).toBe(false);
    });
  });

  describe('Helper functions', () => {
    it('should correctly identify production environment', () => {
      process.env.NODE_ENV = 'production';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      process.env.JWT_SECRET = 'a-very-long-secret-key-that-is-at-least-32-characters-long';

      delete require.cache[require.resolve('../env')];
      const { isProduction, isDevelopment, isTest } = require('../env');

      expect(isProduction()).toBe(true);
      expect(isDevelopment()).toBe(false);
      expect(isTest()).toBe(false);
    });

    it('should correctly identify development environment', () => {
      process.env.NODE_ENV = 'development';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      process.env.JWT_SECRET = 'a-very-long-secret-key-that-is-at-least-32-characters-long';

      delete require.cache[require.resolve('../env')];
      const { isProduction, isDevelopment, isTest } = require('../env');

      expect(isProduction()).toBe(false);
      expect(isDevelopment()).toBe(true);
      expect(isTest()).toBe(false);
    });
  });
});
