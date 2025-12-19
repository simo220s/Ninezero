/**
 * Environment Validator Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Environment Validator', () => {
  // Store original import.meta.env
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    // Reset import.meta.env before each test
    Object.keys(import.meta.env).forEach(key => {
      delete (import.meta.env as any)[key];
    });
    Object.assign(import.meta.env, originalEnv);
  });

  describe('validateEnvironment', () => {
    it('should pass validation with all required variables', () => {
      // Set required variables
      (import.meta.env as any).VITE_SUPABASE_URL = 'https://test.supabase.co';
      (import.meta.env as any).VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';

      // Dynamic import to get fresh module
      const { validateEnvironment } = require('../env-validator');
      const result = validateEnvironment();

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation with missing VITE_SUPABASE_URL', () => {
      // Only set anon key
      (import.meta.env as any).VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';

      const { validateEnvironment } = require('../env-validator');
      const result = validateEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].variable).toBe('VITE_SUPABASE_URL');
    });

    it('should fail validation with invalid Supabase URL', () => {
      (import.meta.env as any).VITE_SUPABASE_URL = 'not-a-valid-url';
      (import.meta.env as any).VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';

      const { validateEnvironment } = require('../env-validator');
      const result = validateEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.variable === 'VITE_SUPABASE_URL')).toBe(true);
    });

    it('should fail validation with invalid JWT token', () => {
      (import.meta.env as any).VITE_SUPABASE_URL = 'https://test.supabase.co';
      (import.meta.env as any).VITE_SUPABASE_ANON_KEY = 'invalid-jwt-token';

      const { validateEnvironment } = require('../env-validator');
      const result = validateEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.variable === 'VITE_SUPABASE_ANON_KEY')).toBe(true);
    });
  });

  describe('getMissingVariables', () => {
    it('should return empty array when all required variables are present', () => {
      (import.meta.env as any).VITE_SUPABASE_URL = 'https://test.supabase.co';
      (import.meta.env as any).VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';

      const { getMissingVariables } = require('../env-validator');
      const missing = getMissingVariables();

      expect(missing).toHaveLength(0);
    });

    it('should return missing variable names', () => {
      // Clear all env vars
      delete (import.meta.env as any).VITE_SUPABASE_URL;
      delete (import.meta.env as any).VITE_SUPABASE_ANON_KEY;

      const { getMissingVariables } = require('../env-validator');
      const missing = getMissingVariables();

      expect(missing).toContain('VITE_SUPABASE_URL');
      expect(missing).toContain('VITE_SUPABASE_ANON_KEY');
    });
  });

  describe('isEnvironmentConfigured', () => {
    it('should return true when environment is configured', () => {
      (import.meta.env as any).VITE_SUPABASE_URL = 'https://test.supabase.co';
      (import.meta.env as any).VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';

      const { isEnvironmentConfigured } = require('../env-validator');
      expect(isEnvironmentConfigured()).toBe(true);
    });

    it('should return false when environment is not configured', () => {
      delete (import.meta.env as any).VITE_SUPABASE_URL;

      const { isEnvironmentConfigured } = require('../env-validator');
      expect(isEnvironmentConfigured()).toBe(false);
    });
  });
});
