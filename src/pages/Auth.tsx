import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { z } from 'zod';
import BrandLockup from '@/components/BrandLockup';
import BrandStripe from '@/components/BrandStripe';
import SEOHead from '@/components/SEOHead';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ForgotPasswordDialog } from '@/components/auth/ForgotPasswordDialog';
const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});
const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirm?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const {
    signIn,
    signUp,
    isAuthenticated,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();

  // Store redirect param in sessionStorage if present
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      sessionStorage.setItem('pending_redirect', redirect);
    }
  }, [searchParams]);

  // Redirect if already authenticated - handle pending intents
  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Check for pending place favorite (QR code / toast flow)
      const pendingPlaceId = sessionStorage.getItem('pending_favorite_place_id');
      if (pendingPlaceId) {
        sessionStorage.removeItem('pending_favorite_place_id');
        navigate(`/places?save=${pendingPlaceId}`);
        return;
      }

      // Check for pending event favorite (toast flow)
      const pendingEventId = sessionStorage.getItem('pending_favorite_event_id');
      if (pendingEventId) {
        sessionStorage.removeItem('pending_favorite_event_id');
        navigate(`/places?saveEvent=${pendingEventId}`);
        return;
      }

      // Check for pending invite token
      const pendingInviteToken = sessionStorage.getItem('pending_invite_token');
      if (pendingInviteToken) {
        navigate(`/invite/${pendingInviteToken}`);
        return;
      }

      // Check for general redirect (e.g., pricing page)
      const pendingRedirect = sessionStorage.getItem('pending_redirect');
      if (pendingRedirect) {
        sessionStorage.removeItem('pending_redirect');
        navigate(`/${pendingRedirect}?checkout=true`);
        return;
      }
      navigate('/places');
    }
  }, [isAuthenticated, loading, navigate]);
  const validateForm = () => {
    const newErrors: typeof errors = {};
    try {
      authSchema.parse({
        email,
        password
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.errors.forEach(e => {
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
        const {
          error
        } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Invalid credentials',
              description: 'Please check your email and password.',
              variant: 'destructive'
            });
          } else {
            toast({
              title: 'Sign in failed',
              description: error.message,
              variant: 'destructive'
            });
          }
          return;
        }
        // Check for pending favorite (QR code flow)
        const pendingPlaceId = sessionStorage.getItem('pending_favorite_place_id');
        if (pendingPlaceId) {
          sessionStorage.removeItem('pending_favorite_place_id');
          navigate(`/places?save=${pendingPlaceId}`);
          return;
        }
        // Check for pending invite token
        const pendingInviteToken = sessionStorage.getItem('pending_invite_token');
        if (pendingInviteToken) {
          navigate(`/invite/${pendingInviteToken}`);
          return;
        }
        // Check for general redirect (e.g., pricing page)
        const pendingRedirect = sessionStorage.getItem('pending_redirect');
        if (pendingRedirect) {
          sessionStorage.removeItem('pending_redirect');
          navigate(`/${pendingRedirect}?checkout=true`);
          return;
        }
        navigate('/places');
      } else {
        const {
          error
        } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account exists',
              description: 'This email is already registered. Try signing in instead.',
              variant: 'destructive'
            });
          } else {
            toast({
              title: 'Sign up failed',
              description: error.message,
              variant: 'destructive'
            });
          }
          return;
        }
toast({
              title: 'Welcome',
              description: 'Start exploring places where shared interests take shape.'
            });
        // Check for pending favorite (QR code flow)
        const pendingPlaceId = sessionStorage.getItem('pending_favorite_place_id');
        if (pendingPlaceId) {
          sessionStorage.removeItem('pending_favorite_place_id');
          navigate(`/places?save=${pendingPlaceId}`);
          return;
        }
        // Check for pending invite token
        const pendingInviteToken = sessionStorage.getItem('pending_invite_token');
        if (pendingInviteToken) {
          navigate(`/invite/${pendingInviteToken}`);
          return;
        }
        // Check for general redirect (e.g., pricing page)
        const pendingRedirect = sessionStorage.getItem('pending_redirect');
        if (pendingRedirect) {
          sessionStorage.removeItem('pending_redirect');
          navigate(`/${pendingRedirect}?checkout=true`);
          return;
        }
        navigate('/places');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>;
  }
  return <>
    <SEOHead
      title="Join the ThickTimber Directory"
      description="Create a private account to explore outdoor places, save favorites, and personalize your directory experience over time."
      keywords="sign up, join directory, create account, outdoor places"
      canonicalPath="/auth"
    />
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Ghost Typography Background */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 1.2,
      delay: 0.3
    }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] md:text-[20vw] font-serif font-bold text-primary/[0.03] select-none pointer-events-none whitespace-nowrap">
        {mode === 'signin' ? '→' : '+'}
      </motion.div>

      {/* Header */}
      <header className="p-4 md:p-6 relative z-10">
        <Link to="/">
          <BrandLockup size="sm" showSubtitle={false} />
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-8 relative z-10">
        <div className="w-full max-w-sm space-y-8">
          {/* Title with animations */}
          <div className="text-center space-y-4">
            {/* Mono label */}
            <motion.span initial={{
            opacity: 0,
            y: 12
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5
          }} className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground block">
              {mode === 'signin' ? 'Welcome Back' : 'Get Started'}
            </motion.span>

            {/* Headline */}
            <motion.h1 initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.1
          }} className="text-3xl md:text-4xl font-serif font-semibold text-foreground text-balance">
              {mode === 'signin' ? 'Sign in to continue' : 'Join the directory'}
            </motion.h1>

            {/* Subtitle */}
            <motion.p initial={{
            opacity: 0,
            y: 16
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: 0.15
          }} className="text-muted-foreground text-sm md:text-base leading-relaxed text-pretty">
              {mode === 'signin' ? 'Pick up where you left off and keep exploring places shaped by your interests.' : 'Start discovering outdoor places shaped by shared interests and community patterns.'}
            </motion.p>
          </div>

          {/* Privacy reassurance for signup */}
          {mode === 'signup' && <motion.div initial={{
          opacity: 0,
          y: 12
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.2
        }} className="relative pl-5 py-3">
              <BrandStripe orientation="vertical" size="sm" className="absolute left-0 top-2 bottom-2" />
              <p className="text-muted-foreground leading-relaxed text-xs text-left">
                Your information is private by default. Your account and preferences are used only to personalize the directory and improve recommendations for you. Nothing you save or set is publicly visible.
              </p>
            </motion.div>}

          {/* Form */}
          <motion.form initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.25
        }} onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="h-12" autoComplete="email" autoFocus />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="h-12" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>

            {mode === 'signup' && <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="h-12" autoComplete="new-password" />
                {errors.confirm && <p className="text-sm text-destructive">{errors.confirm}</p>}
              </div>}

            <Button type="submit" variant="accent" className="w-full h-12 text-base" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Join Free'}
            </Button>
          </motion.form>

          {/* Toggle mode */}
          <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.5,
          delay: 0.35
        }} className="text-center">
            <button type="button" onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setErrors({});
          }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {mode === 'signin' ? "New here? Join free" : 'Already a member? Sign in'}
            </button>
          </motion.div>

          {/* Footer note */}
          <motion.p initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.5,
          delay: 0.4
        }} className="text-center text-xs text-muted-foreground/70">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-foreground">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
          </motion.p>
        </div>
      </main>
      
      <ForgotPasswordDialog 
        open={showForgotPassword} 
        onOpenChange={setShowForgotPassword} 
      />
    </div>
  </>;
};
export default Auth;