import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import PageLayout from '@/components/PageLayout';
import SettingsAccountTab from '@/components/settings/SettingsAccountTab';
import SettingsPreferencesTab from '@/components/settings/SettingsPreferencesTab';

/**
 * Unified Settings page with Account and Preferences tabs.
 */
const Settings = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
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
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl md:text-3xl font-serif font-medium">
              Settings
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="account" className="min-h-[44px]">
              Account
            </TabsTrigger>
            <TabsTrigger value="preferences" className="min-h-[44px]">
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="mt-0">
            <SettingsAccountTab />
          </TabsContent>

          <TabsContent value="preferences" className="mt-0">
            <SettingsPreferencesTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default Settings;
