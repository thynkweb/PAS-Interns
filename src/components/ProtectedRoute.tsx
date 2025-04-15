import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isOnboarding } = useAuth();
  const location = useLocation();
  const [checkingWhatsApp, setCheckingWhatsApp] = useState(true);
  const [hasWhatsApp, setHasWhatsApp] = useState(true);

  useEffect(() => {
    const checkWhatsAppNumber = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('whatsapp_number')
            .eq('id', user.id)
            .single();
          console.log("data on update", data);
          
          if (error) {
            console.error('Error fetching user data:', error);
            setHasWhatsApp(false);
          } else {
            // Check if whatsapp_number exists and is not empty
            setHasWhatsApp(!!data.whatsapp_number && data.whatsapp_number.trim() !== '');
          }
          console.log("has wp",hasWhatsApp);
          
        } catch (err) {
          console.error('Error in WhatsApp check:', err);
          setHasWhatsApp(false);
        }
      }
      setCheckingWhatsApp(false);
    };

    if (user && !loading) {
      checkWhatsAppNumber();
    } else if (!loading) {
      setCheckingWhatsApp(false);
    }
  }, [user, loading]);

  // Show loading state while checking authentication or WhatsApp status
  if (loading || checkingWhatsApp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to login/onboarding if user needs to complete it (from AuthContext)
  if (isOnboarding) {
    return <Navigate to="/login" replace />;
  }

  // If user has WhatsApp number and is on the onboarding page, redirect to dashboard
  if (hasWhatsApp && location.pathname === '/onboarding') {
    return <Navigate to="/" replace />;
  }

  // If user doesn't have WhatsApp number and is not on onboarding page, redirect to onboarding
  if (!hasWhatsApp && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // User is authenticated and at the correct location based on their onboarding status
  return <>{children}</>;
}