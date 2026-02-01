import { useState } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle } from 'lucide-react';

const emailSchema = z.string().email('Please enter a valid email address');

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ForgotPasswordDialog = ({ open, onOpenChange }: ForgotPasswordDialogProps) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the reset URL base - use production domain if available
      const resetUrlBase = window.location.origin;
      const resetUrl = `${resetUrlBase}/reset-password`;

      // First, trigger Supabase's built-in password reset
      // This generates the secure token
      const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl,
      });

      if (supabaseError) {
        // Don't reveal if user exists or not for security
        console.error('[ForgotPasswordDialog] Supabase error:', supabaseError);
      }

      // Also send branded email via Resend edge function
      // This runs regardless of Supabase result to avoid user enumeration
      try {
        const { error: functionError } = await supabase.functions.invoke('send-password-reset', {
          body: { email, resetUrl },
        });

        if (functionError) {
          console.error('[ForgotPasswordDialog] Edge function error:', functionError);
        }
      } catch (functionErr) {
        console.error('[ForgotPasswordDialog] Edge function call failed:', functionErr);
      }

      // Always show success to prevent user enumeration
      setIsSuccess(true);
    } catch (err) {
      console.error('[ForgotPasswordDialog] Unexpected error:', err);
      // Still show success to prevent user enumeration
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    setIsSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {isSuccess ? (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-xl font-serif">Check your email</DialogTitle>
              <DialogDescription className="text-base">
                If an account exists for <span className="font-medium text-foreground">{email}</span>, 
                you'll receive a password reset link shortly.
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mt-4">
              Didn't receive the email? Check your spam folder or try again in a few minutes.
            </p>
            <Button 
              onClick={handleClose} 
              className="mt-6 w-full"
              variant="outline"
            >
              Back to sign in
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-serif">Forgot your password?</DialogTitle>
              <DialogDescription>
                Enter your email address and we'll send you a link to reset your password.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-12 pl-10"
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <Button 
                type="submit" 
                className="w-full h-12" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send reset link'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleClose}
              >
                Cancel
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
