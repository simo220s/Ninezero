// Test setup file - runs before all tests
// Set up test environment variables

process.env.JWT_SECRET = 'test-secret-key-minimum-32-characters-long-for-testing-purposes';
process.env.JWT_ACCESS_EXPIRATION = '15m';
process.env.JWT_REFRESH_EXPIRATION = '7d';
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.PORT = '3000';
process.env.CORS_ORIGINS = 'http://localhost:5173';
process.env.LOG_LEVEL = 'error'; // Reduce log noise in tests
