import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import PageLayout from '@/components/PageLayout';
import SettingsAccountTab from '@/components/settings/SettingsAccountTab';
import SettingsPreferencesTab from '@/components/settings/SettingsPreferencesTab';
import { useOverlapSession } from '@/hooks/useOverlapSession';

/**
 * Unified Settings page with Account and Preferences tabs.
 */
const Settings = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { activeSession, hasActiveSession, isLoading: isSessionLoading } = useOverlapSession();
  
  // Initialize tab from URL param or default to 'preferences' (product value first)
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'account' ? 'account' : 'preferences');

  // Show success toast after returning from Stripe checkout
  useEffect(() => {
    if (searchParams.get('subscription') === 'success') {
      toast({
        title: 'Welcome to Pro Personalization',
        description: 'Your subscription is now active. Enjoy deeper personalization.',
      });
      // Clear the param to prevent re-triggering
      searchParams.delete('subscription');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, toast]);

  return (
    <PageLayout>
      <div className="container py-8 md:py-12 max-w-2xl">
        {/* Header - Elevated, editorial */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="mb-4 hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight">
            Settings
          </h1>
        </div>

        {/* Discover Together Entry Card */}
        <Link 
          to={hasActiveSession ? '/together' : '/together'}
          className="block mb-10 group"
        >
          <div className="bg-muted/30 border border-border rounded-xl p-5 flex items-center gap-4 transition-all hover:bg-muted/50 hover:border-primary/20">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-base mb-0.5">Discover Together</h3>
              {isSessionLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : hasActiveSession && activeSession ? (
                <p className="text-sm text-primary">
                  Active session with {activeSession.partner_name || 'partner'} — View results
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Find places that work for both of you
                </p>
              )}
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </div>
        </Link>

        {/* Premium underline-style tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-transparent border-b border-border rounded-none p-0 h-auto mb-10">
            <TabsTrigger 
              value="preferences" 
              className="min-h-[48px] rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 mr-6 text-base transition-colors"
            >
              Preferences
            </TabsTrigger>
            <TabsTrigger 
              value="account" 
              className="min-h-[48px] rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 text-base transition-colors"
            >
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preferences" className="mt-0">
            <SettingsPreferencesTab />
          </TabsContent>

          <TabsContent value="account" className="mt-0">
            <SettingsAccountTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default Settings;
