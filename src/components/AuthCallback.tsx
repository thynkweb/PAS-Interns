// src/components/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error handling auth redirect:', error);
        navigate('/login');
        return;
      }

      if (session) {
        navigate('/'); // Redirect to your app's main page
      } else {
        navigate('/login');
      }
    };

    handleAuthRedirect();
  }, [navigate]);

  return <div>Loading...</div>;
};