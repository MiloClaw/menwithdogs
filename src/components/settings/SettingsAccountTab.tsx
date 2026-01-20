import { useState } from 'react';
import { Mail, Lock, CreditCard, Sparkles, User, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import ChangePasswordDialog from './ChangePasswordDialog';
import DeleteAccountDialog from './DeleteAccountDialog';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const SettingsAccountTab = () => {
  const { user } = useAuth();
  const { 
    isPro,
    isAmbassador,
    subscriptionEnd, 
    createCheckout, 
    isCreatingCheckout,
    openCustomerPortal,
    isOpeningPortal,
    isLoading: isLoadingSubscription 
  } = useSubscription();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionsExpanded, setActionsExpanded] = useState(false);

  return (
    <div className="space-y-6">
      {/* Unified Account Card — refined treatment */}
      <Card className={cn(
        'border-border/50',
        isPro && 'border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.08)]'
      )}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-4 w-4 text-muted-foreground" />
            Your Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          {/* Email row */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </div>
            <span className="text-sm">{user?.email || 'Not available'}</span>
          </div>
          
          <Separator className="opacity-50" />
          
          {/* Password row */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Password</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-9 text-sm hover:bg-muted/50 transition-colors"
              onClick={() => setPasswordDialogOpen(true)}
            >
              Change
            </Button>
          </div>
          
          <Separator className="opacity-50" />
          
          {/* Subscription row */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isPro ? (
                <Sparkles className="h-4 w-4 text-primary" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              <span>Plan</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end gap-0.5">
                <Badge 
                  variant={isPro ? 'default' : 'secondary'}
                  className={isPro ? 'shadow-sm' : ''}
                >
                  {isAmbassador ? 'Ambassador' : isPro ? 'Pro' : 'Free'}
                </Badge>
                {isPro && !isAmbassador && subscriptionEnd && (
                  <span className="text-xs text-muted-foreground">
                    Renews {format(new Date(subscriptionEnd), 'MMM d')}
                  </span>
                )}
              </div>
              {isLoadingSubscription ? (
                <span className="text-xs text-muted-foreground">...</span>
              ) : isPro ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 text-sm hover:bg-muted/50 transition-colors"
                  onClick={() => openCustomerPortal()}
                  disabled={isOpeningPortal}
                >
                  {isOpeningPortal ? '...' : 'Manage'}
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  className="h-9 text-sm"
                  onClick={() => createCheckout()}
                  disabled={isCreatingCheckout}
                >
                  {isCreatingCheckout ? '...' : 'Upgrade'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collapsible Account Actions */}
      <Collapsible open={actionsExpanded} onOpenChange={setActionsExpanded}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between h-12 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-sm">Account actions</span>
            <ChevronRight className={cn(
              "h-4 w-4 transition-transform duration-200",
              actionsExpanded && "rotate-90"
            )} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <Card className="border-border/50">
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data.
              </p>
              <Button 
                variant="destructive" 
                size="sm"
                className="min-h-[44px]"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Dialogs */}
      <ChangePasswordDialog 
        open={passwordDialogOpen} 
        onOpenChange={setPasswordDialogOpen} 
      />
      <DeleteAccountDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen} 
      />
    </div>
  );
};

export default SettingsAccountTab;