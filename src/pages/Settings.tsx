import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
        {/* Header - Elevated, editorial */}
        <div className="mb-12">
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
