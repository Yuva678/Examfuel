import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check for error in the URL (from Supabase redirects)
      const queryParams = new URLSearchParams(location.search);
      const hashParams = new URLSearchParams(location.hash.substring(1));
      
      const error = queryParams.get('error') || hashParams.get('error');
      const errorDescription = queryParams.get('error_description') || hashParams.get('error_description');

      if (error) {
        setErrorMsg(errorDescription || 'Authentication failed. Please try again.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
        return;
      }

      // The supabase-js client automatically parses the hash and sets the session
      // Wait for it to complete the initialization/exchange
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setErrorMsg('Failed to establish session. Please try logging in again.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
        return;
      }

      // Session established successfully, redirect user
      // If we passed a custom "next" parameter in the redirect, use it
      const next = queryParams.get('next') || '/';
      navigate(next, { replace: true });
    };

    handleAuthCallback();
  }, [navigate, location]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-surface-100 p-8 shadow-soft border border-gold-border text-center">
        {errorMsg ? (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 mb-4">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Authentication Error</h2>
            <p className="text-red-400">{errorMsg}</p>
            <p className="text-gray-400 text-sm mt-4">Redirecting you back to login...</p>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center mb-4">
              <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full"></div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Completing Sign In</h2>
            <p className="text-gray-400">Please wait while we securely log you in...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
