import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageLayout from '@/components/PageLayout';
import { SessionGenerator } from '@/components/discover/SessionGenerator';
import { SessionJoin } from '@/components/discover/SessionJoin';
import { OverlapResults } from '@/components/discover/OverlapResults';
import { useOverlapSession } from '@/hooks/useOverlapSession';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DiscoverTogether() {
  const { token: urlToken } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const {
    activeSession,
    pendingSession,
    isWaitingForPartner,
    hasActiveSession,
    isLoading,
    isCreating,
    isJoining,
    isEnding,
    createSession,
    joinSession,
    endSession,
    cancelPending,
  } = useOverlapSession();

  // Auto-join if URL has token and user is authenticated
  useEffect(() => {
    if (urlToken && isAuthenticated && !isLoading && !hasActiveSession && !isWaitingForPartner) {
      joinSession(urlToken);
    }
  }, [urlToken, isAuthenticated, isLoading, hasActiveSession, isWaitingForPartner, joinSession]);

  // Show loading while checking auth
  if (authLoading || isLoading) {
    return (
      <PageLayout>
        <Helmet>
          <title>Discover Together | MainStreetIRL</title>
        </Helmet>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  // Show auth prompt if not logged in
  if (!isAuthenticated) {
    return (
      <PageLayout>
        <Helmet>
          <title>Discover Together | MainStreetIRL</title>
        </Helmet>
        <div className="max-w-md mx-auto px-4 py-12">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Discover Together</CardTitle>
              <CardDescription>
                Sign in to find places you'll both love
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <Link to={`/auth?redirect=${encodeURIComponent(window.location.pathname)}`}>
                  Sign In
                </Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/auth?tab=signup" className="text-primary hover:underline">
                  Sign up free
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Show active session results
  if (hasActiveSession && activeSession) {
    return (
      <PageLayout>
        <Helmet>
          <title>Discovering with {activeSession.partner_name} | MainStreetIRL</title>
          <meta name="description" content="Find places you'll both love" />
        </Helmet>
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4"
            onClick={() => navigate('/places')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Places
          </Button>
          
          <OverlapResults
            partnerName={activeSession.partner_name}
            expiresAt={activeSession.expires_at}
            onEndSession={endSession}
            isEnding={isEnding}
          />
        </div>
      </PageLayout>
    );
  }

  // Show waiting state when pending session exists
  if (isWaitingForPartner && pendingSession) {
    return (
      <PageLayout>
        <Helmet>
          <title>Waiting for Partner | MainStreetIRL</title>
        </Helmet>
        <div className="container max-w-md mx-auto px-4 py-12">
          <SessionGenerator
            token={pendingSession.token}
            expiresAt={pendingSession.expires_at}
            onCancel={cancelPending}
            isCancelling={isEnding}
          />
        </div>
      </PageLayout>
    );
  }

  // Default: Show create/join options
  return (
    <PageLayout>
      <Helmet>
        <title>Discover Together | MainStreetIRL</title>
        <meta name="description" content="Find places you'll both love. Connect temporarily with a partner or friend to see place recommendations that work for both of you." />
      </Helmet>
      <div className="container max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Discover Together</h1>
          <p className="text-muted-foreground">
            Connect with a partner or friend to find places you'll both love
          </p>
        </div>

        <SessionJoin
          onJoin={joinSession}
          onCreateNew={createSession}
          isJoining={isJoining}
          isCreating={isCreating}
          initialToken={urlToken}
        />

        <div className="mt-8 text-center text-xs text-muted-foreground space-y-1">
          <p>Sessions expire after 24 hours</p>
          <p>Your preferences stay private — only shared recommendations are shown</p>
        </div>
      </div>
    </PageLayout>
  );
}
