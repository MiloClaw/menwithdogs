import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

type InviteStatus = 'loading' | 'needs_auth' | 'validating' | 'success' | 'error';

interface InviteError {
  message: string;
  code?: string;
}

const Invite = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<InviteStatus>('loading');
  const [error, setError] = useState<InviteError | null>(null);
  
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setStatus('needs_auth');
      return;
    }

    // User is authenticated, validate the invite
    validateInvite();
  }, [authLoading, isAuthenticated, token]);

  const validateInvite = async () => {
    if (!token) {
      setError({ message: 'Invalid invitation link', code: 'NO_TOKEN' });
      setStatus('error');
      return;
    }

    setStatus('validating');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('validate-invite', {
        body: { token },
      });

      if (fnError) throw fnError;

      if (data.error) {
        setError({ message: data.error, code: data.code });
        setStatus('error');
        return;
      }

      setStatus('success');
      toast({
        title: 'Welcome!',
        description: "You've joined the couple. Let's set up your profile.",
      });
      
      // Redirect to complete profile
      setTimeout(() => {
        navigate('/onboarding/my-profile');
      }, 1500);
    } catch (err) {
      console.error('Invite validation error:', err);
      setError({ 
        message: err instanceof Error ? err.message : 'Failed to accept invitation' 
      });
      setStatus('error');
    }
  };

  const handleSignUp = () => {
    // Store invite token in sessionStorage so we can use it after auth
    if (token) {
      sessionStorage.setItem('pending_invite_token', token);
    }
    navigate('/auth');
  };

  // Check for pending invite after auth
  useEffect(() => {
    if (isAuthenticated && status === 'needs_auth') {
      const pendingToken = sessionStorage.getItem('pending_invite_token');
      if (pendingToken === token) {
        sessionStorage.removeItem('pending_invite_token');
        validateInvite();
      }
    }
  }, [isAuthenticated, status, token]);

  if (authLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 md:p-6">
        <a href="/" className="text-xl font-serif font-semibold text-primary">
          MainStreetIRL
        </a>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-sm space-y-8 text-center">
          {status === 'needs_auth' && (
            <>
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-serif font-semibold text-primary">
                  You're invited!
                </h1>
                <p className="text-muted-foreground">
                  Your partner has invited you to create a couple profile together.
                </p>
              </div>

              <div className="p-4 bg-surface rounded-card border border-border">
                <p className="text-sm text-muted-foreground">
                  Create an account or sign in to accept this invitation.
                </p>
              </div>

              <Button
                onClick={handleSignUp}
                className="w-full h-12 text-base"
              >
                Continue
              </Button>
            </>
          )}

          {status === 'validating' && (
            <>
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-serif font-semibold text-primary">
                  Accepting invitation...
                </h1>
                <p className="text-muted-foreground">
                  Just a moment while we set things up.
                </p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-secondary/20 flex items-center justify-center">
                <span className="text-secondary text-2xl">✓</span>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-serif font-semibold text-primary">
                  You're in!
                </h1>
                <p className="text-muted-foreground">
                  Redirecting to your profile setup...
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-serif font-semibold text-primary">
                  Something went wrong
                </h1>
                <p className="text-muted-foreground">
                  {error?.message || 'Unable to process this invitation.'}
                </p>
              </div>

              {error?.code === 'EMAIL_MISMATCH' && (
                <div className="p-4 bg-destructive/10 rounded-card border border-destructive/20">
                  <p className="text-sm text-foreground">
                    This invitation was sent to a different email. Please sign in with the email address that received the invitation.
                  </p>
                </div>
              )}

              {error?.code === 'ALREADY_IN_COUPLE' && (
                <div className="p-4 bg-surface rounded-card border border-border">
                  <p className="text-sm text-muted-foreground">
                    You already have a couple profile. Each person can only be part of one couple.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="w-full h-12"
                >
                  Go to homepage
                </Button>
                {error?.code === 'EMAIL_MISMATCH' && (
                  <Button
                    onClick={() => {
                      supabase.auth.signOut();
                      setStatus('needs_auth');
                    }}
                    className="w-full h-12"
                  >
                    Sign in with different email
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Invite;
