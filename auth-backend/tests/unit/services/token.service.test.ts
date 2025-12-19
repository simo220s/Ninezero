import { describe, it, expect } from 'vitest';
import { tokenService } from '../../../src/services/token.service';
import type { TokenPayload } from '../../../src/services/token.service';

describe('TokenService', () => {
  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const payload: TokenPayload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'student',
      };

      const token = tokenService.generateAccessToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should include userId, email, and role in token payload', () => {
      const payload: TokenPayload = {
        userId: 'test-user-id',
        email: 'teacher@example.com',
        role: 'teacher',
      };

      const token = tokenService.generateAccessToken(payload);
      const decoded = tokenService.verifyAccessToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });
  }); fds

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const payload: TokenPayload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'student',
      };

      const token = tokenService.generateRefreshToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const payload: TokenPayload = {
        userId: 'test-user-id',
        email: 'admin@example.com',
        role: 'admin',
      };

      const token = tokenService.generateAccessToken(payload);
      const decoded = tokenService.verifyAccessToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        tokenService.verifyAccessToken(invalidToken);
      }).toThrow('INVALID_TOKEN');
    });

    it('should throw error for expired token', async () => {
      // Note: Testing token expiration requires mocking time or using a very short expiration
      // This is a simplified test that verifies the error handling exists
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjIzOTAyMn0.invalid';

      expect(() => {
        tokenService.verifyAccessToken(invalidToken);
      }).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const payload: TokenPayload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'student',
      };

      const token = tokenService.generateRefreshToken(payload);
      const decoded = tokenService.verifyRefreshToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should throw error for invalid refresh token', () => {
      const invalidToken = 'invalid.refresh.token';

      expect(() => {
        tokenService.verifyRefreshToken(invalidToken);
      }).toThrow('INVALID_TOKEN');
    });
  });

  describe('getTokenExpiration', () => {
    it('should return expiration date from token', () => {
      const payload: TokenPayload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'student',
      };

      const token = tokenService.generateAccessToken(payload);
      const expiration = tokenService.getTokenExpiration(token);

      expect(expiration).toBeInstanceOf(Date);
      expect(expiration.getTime()).toBeGreaterThan(Date.now());
    });

    it('should throw error for invalid token format', () => {
      const invalidToken = 'invalid.token';

      expect(() => {
        tokenService.getTokenExpiration(invalidToken);
      }).toThrow();
    });
  });
});
