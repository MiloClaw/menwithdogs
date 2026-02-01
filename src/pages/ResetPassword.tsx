import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import BrandLockup from '@/components/BrandLockup';
import BrandStripe from '@/components/BrandStripe';
import SEOHead from '@/components/SEOHead';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';

const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetState = 'loading' | 'ready' | 'success' | 'error' | 'expired';

const ResetPassword = () => {
  const [state, setState] = useState<ResetState>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for recovery token in URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (type === 'recovery' && accessToken) {
      // Valid recovery link
      setState('ready');
    } else {
      // Check if we're in a valid session from the recovery flow
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setState('ready');
        } else {
          setState('expired');
        }
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate passwords
    const result = passwordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'password') fieldErrors.password = err.message;
        if (err.path[0] === 'confirmPassword') fieldErrors.confirmPassword = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error('[ResetPassword] Update error:', error);
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          setState('expired');
        } else {
          toast({
            title: 'Error',
            description: error.message || 'Failed to update password',
            variant: 'destructive',
          });
        }
        return;
      }

      setState('success');
      toast({
        title: 'Password updated',
        description: 'Your password has been successfully reset.',
      });

      // Redirect to places after a short delay
      setTimeout(() => {
        navigate('/places');
      }, 2000);
    } catch (err) {
      console.error('[ResetPassword] Unexpected error:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Reset Password | ThickTimber"
        description="Set a new password for your ThickTimber account."
        canonicalPath="/reset-password"
      />
      <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
        {/* Ghost Typography Background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] md:text-[20vw] font-serif font-bold text-primary/[0.03] select-none pointer-events-none whitespace-nowrap"
        >
          ↻
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
            {state === 'loading' && (
              <div className="text-center">
                <p className="text-muted-foreground">Verifying reset link...</p>
              </div>
            )}

            {state === 'expired' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
                <h1 className="text-2xl font-serif font-semibold">Link expired</h1>
                <p className="text-muted-foreground">
                  This password reset link has expired or is invalid. Please request a new one.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/auth">Back to sign in</Link>
                </Button>
              </motion.div>
            )}

            {state === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-serif font-semibold">Password updated</h1>
                <p className="text-muted-foreground">
                  Your password has been successfully reset. Redirecting you now...
                </p>
              </motion.div>
            )}

            {state === 'ready' && (
              <>
                {/* Title with animations */}
                <div className="text-center space-y-4">
                  <motion.span
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground block"
                  >
                    Almost there
                  </motion.span>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-3xl md:text-4xl font-serif font-semibold text-foreground"
                  >
                    Set your new password
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-muted-foreground text-sm md:text-base"
                  >
                    Choose a strong password with at least 8 characters.
                  </motion.p>
                </div>

                {/* Password requirements hint */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative pl-5 py-3"
                >
                  <BrandStripe orientation="vertical" size="sm" className="absolute left-0 top-2 bottom-2" />
                  <p className="text-muted-foreground leading-relaxed text-xs text-left">
                    Your password should be at least 8 characters long. We recommend using a mix of letters, numbers, and symbols.
                  </p>
                </motion.div>

                {/* Form */}
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="password">New password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-12"
                      autoComplete="new-password"
                      autoFocus
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm new password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-12"
                      autoComplete="new-password"
                    />
                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                  </div>

                  <Button
                    type="submit"
                    variant="accent"
                    className="w-full h-12 text-base"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating...' : 'Update password'}
                  </Button>
                </motion.form>

                {/* Back to sign in */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  className="text-center"
                >
                  <Link
                    to="/auth"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back to sign in
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default ResetPassword;
