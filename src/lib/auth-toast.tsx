import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

interface AuthToastOptions {
  title: string;
  description: string;
  intentKey?: string;
  intentValue?: string;
  onNavigate: () => void;
}

/**
 * Show an auth-required toast with an actionable "Sign In" button.
 * Optionally stores user intent in sessionStorage for post-auth flow.
 */
export function showAuthToast({
  title,
  description,
  intentKey,
  intentValue,
  onNavigate,
}: AuthToastOptions) {
  // Store intent if provided
  if (intentKey && intentValue) {
    sessionStorage.setItem(intentKey, intentValue);
  }

  toast({
    title,
    description,
    action: (
      <ToastAction altText="Sign in" onClick={onNavigate}>
        Sign In
      </ToastAction>
    ),
  });
}
