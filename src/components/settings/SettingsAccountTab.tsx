import { useState } from 'react';
import { Mail, Lock, CreditCard, AlertTriangle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import ChangePasswordDialog from './ChangePasswordDialog';
import DeleteAccountDialog from './DeleteAccountDialog';
import { format } from 'date-fns';

const SettingsAccountTab = () => {
  const { user } = useAuth();
  const { 
    isPro, 
    subscriptionEnd, 
    createCheckout, 
    isCreatingCheckout,
    openCustomerPortal,
    isOpeningPortal,
    isLoading: isLoadingSubscription 
  } = useSubscription();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-4 w-4" />
            Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground">{user?.email || 'Not available'}</p>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-4 w-4" />
            Password
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-muted-foreground">••••••••</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setPasswordDialogOpen(true)}
          >
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className={isPro ? 'border-primary/50' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {isPro ? (
              <Sparkles className="h-4 w-4 text-primary" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            Subscription
          </CardTitle>
          {isPro && subscriptionEnd && (
            <CardDescription>
              Renews {format(new Date(subscriptionEnd), 'MMM d, yyyy')}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={isPro ? 'default' : 'secondary'}>
              {isPro ? 'Pro Personalization' : 'Free'}
            </Badge>
            {isPro && (
              <span className="text-sm text-muted-foreground">
                $4.99/month
              </span>
            )}
          </div>
          
          {isLoadingSubscription ? (
            <span className="text-sm text-muted-foreground">Loading...</span>
          ) : isPro ? (
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px]"
              onClick={() => openCustomerPortal()}
              disabled={isOpeningPortal}
            >
              {isOpeningPortal ? 'Loading...' : 'Manage'}
            </Button>
          ) : (
            <Button
              size="sm"
              className="min-h-[44px]"
              onClick={() => createCheckout()}
              disabled={isCreatingCheckout}
            >
              {isCreatingCheckout ? 'Loading...' : 'Add personalization'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

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
