import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@tanstack/react-query', 'react-hook-form', 'zod'],
          'supabase-vendor': ['@supabase/supabase-js'],
          
          // Feature chunks
          'auth-features': [
            './src/features/auth/components/SignupPage',
            './src/features/auth/components/LoginPage',
            './src/features/auth/components/ForgotPasswordPage',
            './src/features/auth/components/ResetPasswordPage'
          ],
          'dashboard-features': [
            './src/features/dashboard/components/StudentDashboard',
            './src/features/dashboard/components/TeacherDashboard'
          ],
          'booking-features': [
            './src/features/booking/components/BookTrialPage',
            './src/features/booking/components/BookRegularPage'
          ]
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging
    sourcemap: false,
    // Minify for production
    minify: 'terser'
  },
  // Development server optimizations
  server: {
    // Optimize HMR
    hmr: {
      overlay: true
    },
    // Proxy API requests to Laravel backend
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/oauth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'react-hook-form',
      'zod',
      '@supabase/supabase-js'
    ]
  },
  // CSS optimization
  css: {
    devSourcemap: true
  }
})