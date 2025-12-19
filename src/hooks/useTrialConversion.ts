import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '@/lib/utils/api-client';
import { logger } from '@/lib/utils/logger';

interface ConversionStatus {
  isTrial: boolean;
  trialCompleted: boolean;
  convertedAt: string | null;
  shouldRedirect: boolean;
}

export function useTrialConversion() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversionStatus, setConversionStatus] = useState<ConversionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  /**
   * Check conversion status
   */
  const checkConversionStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiGet<ConversionStatus>('/api/conversion/check-status');
      
      if (response.success && response.data) {
        const status = response.data;
        setConversionStatus(status);

        // Check if user just converted (within last 5 minutes)
        if (status.convertedAt) {
          const convertedTime = new Date(status.convertedAt).getTime();
          const now = new Date().getTime();
          const fiveMinutes = 5 * 60 * 1000;

          if (now - convertedTime < fiveMinutes) {
            // Check if we haven't shown welcome yet
            const welcomeShown = sessionStorage.getItem('welcomeShown');
            if (!welcomeShown) {
              setShowWelcome(true);
              sessionStorage.setItem('welcomeShown', 'true');
            }
          }
        }
      }
    } catch (error) {
      logger.error('Error checking conversion status:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle redirect after conversion
   */
  const handleConversionRedirect = () => {
    if (conversionStatus?.shouldRedirect) {
      // Redirect from trial dashboard to regular dashboard
      navigate('/dashboard/student', { replace: true });
    }
  };

  /**
   * Dismiss welcome message
   */
  const dismissWelcome = () => {
    setShowWelcome(false);
  };

  // Check status on mount and when user changes
  useEffect(() => {
    checkConversionStatus();
  }, [user]);

  // Auto-redirect if needed
  useEffect(() => {
    if (conversionStatus?.shouldRedirect) {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/trial')) {
        handleConversionRedirect();
      }
    }
  }, [conversionStatus]);

  return {
    conversionStatus,
    loading,
    showWelcome,
    dismissWelcome,
    checkConversionStatus,
    handleConversionRedirect,
  };
}
