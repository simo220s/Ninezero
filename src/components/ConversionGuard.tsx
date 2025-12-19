import { useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrialConversion } from '@/hooks/useTrialConversion';

interface ConversionGuardProps {
  children: ReactNode;
  requireTrial?: boolean; // If true, only allow trial students
  requireRegular?: boolean; // If true, only allow regular students
}

export default function ConversionGuard({
  children,
  requireTrial = false,
  requireRegular = false,
}: ConversionGuardProps) {
  const { conversionStatus, loading } = useTrialConversion();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !conversionStatus) return;

    // If route requires trial but user is regular, redirect
    if (requireTrial && !conversionStatus.isTrial) {
      navigate('/dashboard/student', { replace: true });
    }

    // If route requires regular but user is trial, redirect
    if (requireRegular && conversionStatus.isTrial) {
      navigate('/dashboard/trial', { replace: true });
    }
  }, [conversionStatus, loading, requireTrial, requireRegular, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
