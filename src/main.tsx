import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/reset.css'
import './index.css'
import './styles/browser-fixes.css'
import '@emran-alhaddad/saudi-riyal-font/index.css'
import App from './App.tsx'
import { logger } from './lib/logger'
import { validateEnvironment, getMissingVariables } from './lib/config/env-validator'
import { connectionManager } from './lib/supabase/connection-manager'
import { applyBrowserFixes, logBrowserInfo, getBrowserWarning } from './lib/utils/browser-detection'

// Make logger available globally
;(globalThis as any).logger = logger

// Apply browser-specific fixes
applyBrowserFixes()

// Log browser information for debugging
if (import.meta.env.DEV) {
  logBrowserInfo()
}

// Check browser compatibility and show warning if needed
const browserWarning = getBrowserWarning()
if (browserWarning) {
  logger.warn(browserWarning)
  // Could show a toast notification here if desired
}

// Validate environment variables on startup
try {
  const validation = validateEnvironment();
  
  if (!validation.isValid) {
    const missingVars = getMissingVariables();
    const errorMessage = `Missing required environment variables:\n${missingVars.join('\n')}\n\nPlease check your .env file.`;
    
    // Show error in UI
    document.getElementById('root')!.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 2rem;
        background-color: #f9fafb;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="
          max-width: 600px;
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        ">
          <h1 style="color: #dc2626; margin-bottom: 1rem; font-size: 1.5rem;">
            ⚠️ Configuration Error
          </h1>
          <p style="color: #374151; margin-bottom: 1rem; line-height: 1.6;">
            The application cannot start because required environment variables are missing.
          </p>
          <div style="
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 4px;
            padding: 1rem;
            margin-bottom: 1rem;
          ">
            <p style="color: #991b1b; font-weight: 600; margin-bottom: 0.5rem;">
              Missing Variables:
            </p>
            <ul style="color: #991b1b; margin-left: 1.5rem;">
              ${missingVars.map(v => `<li>${v}</li>`).join('')}
            </ul>
          </div>
          <p style="color: #6b7280; font-size: 0.875rem;">
            Please create a <code style="background: #f3f4f6; padding: 0.125rem 0.25rem; border-radius: 2px;">.env.local</code> file 
            in the project root with the required variables. See <code style="background: #f3f4f6; padding: 0.125rem 0.25rem; border-radius: 2px;">.env.production.example</code> 
            for reference.
          </p>
        </div>
      </div>
    `;
    
    throw new Error(errorMessage);
  }
  
  logger.info('Environment validation successful');
} catch (error) {
  logger.error('Environment validation failed:', error);
  // Error UI already shown above, just prevent app from rendering
  throw error;
}

// Initialize Supabase connection manager
connectionManager.initialize().catch((error) => {
  logger.error('Failed to initialize Supabase connection:', error);
  // App will still render but with connection errors handled gracefully
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
