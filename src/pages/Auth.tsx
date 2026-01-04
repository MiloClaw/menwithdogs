import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn, signUp, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated - go directly to places
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const pendingInviteToken = sessionStorage.getItem('pending_invite_token');
      if (pendingInviteToken) {
        navigate(`/invite/${pendingInviteToken}`);
      } else {
        navigate('/places');
      }
    }
  }, [isAuthenticated, loading, navigate]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    try {
      authSchema.parse({ email, password });
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.errors.forEach((e) => {
          if (e.path[0] === 'email') newErrors.email = e.message;
          if (e.path[0] === 'password') newErrors.password = e.message;
        });
      }
    }

    if (mode === 'signup' && password !== confirmPassword) {
      newErrors.confirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Invalid credentials',
              description: 'Please check your email and password.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Sign in failed',
              description: error.message,
              variant: 'destructive',
            });
          }
          return;
        }
        // Check for pending intent (invite flow)
        const pendingInviteToken = sessionStorage.getItem('pending_invite_token');
        if (pendingInviteToken) {
          navigate(`/invite/${pendingInviteToken}`);
        } else {
          navigate('/places');
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account exists',
              description: 'This email is already registered. Try signing in instead.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Sign up failed',
              description: error.message,
              variant: 'destructive',
            });
          }
          return;
        }
        toast({
          title: 'Welcome!',
          description: 'Your account has been created.',
        });
        // Check for pending intent (invite flow)
        const pendingInviteToken = sessionStorage.getItem('pending_invite_token');
        if (pendingInviteToken) {
          navigate(`/invite/${pendingInviteToken}`);
        } else {
          navigate('/places');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
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
        <Link to="/" className="text-xl font-serif font-semibold text-primary">
          MainStreetIRL
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Title */}
          <div className="text-center space-y-3">
            <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground">
              {mode === 'signin' ? 'Welcome back' : 'Join quietly'}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              {mode === 'signin' 
                ? 'Sign in to continue discovering your community' 
                : 'Start discovering places where your community gathers'}
            </p>
          </div>

          {/* Privacy reassurance for signup */}
          {mode === 'signup' && (
            <div className="bg-surface rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your information stays private by default.<br />
                No public profile. No exposure unless you choose it.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-12"
                autoComplete="email"
                autoFocus
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12"
                  autoComplete="new-password"
                />
                {errors.confirm && (
                  <p className="text-sm text-destructive">{errors.confirm}</p>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? 'Please wait...' 
                : mode === 'signin' 
                  ? 'Sign in' 
                  : 'Get started'}
            </Button>
          </form>

          {/* Toggle mode */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setErrors({});
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === 'signin' 
                ? "New here? Create an account" 
                : 'Already a member? Sign in'}
            </button>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-muted-foreground/70">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-foreground">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Auth;
