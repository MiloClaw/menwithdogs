import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContextDefinitionEditor from '@/components/admin/pro-contexts/ContextDefinitionEditor';
import PlacePriorEditor from '@/components/admin/pro-contexts/PlacePriorEditor';
import DensityOverview from '@/components/admin/pro-contexts/DensityOverview';

/**
 * Admin page for Pro Context Density Intelligence management.
 * 
 * ADMIN CAPABILITIES:
 * - Manage context vocabulary (pro_context_definitions)
 * - Manage place priors (place_context_priors)
 * - View aggregate density (place_context_density) - only where meets_k_threshold
 * - Trigger rebuild job
 * 
 * ADMIN CANNOT:
 * - View per-user selections
 * - View individual signals
 * - Override rankings
 * - See raw user counts
 */
const ProContextManagement = () => {
  const [activeTab, setActiveTab] = useState('definitions');

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Pro Contexts</h1>
          <p className="text-muted-foreground mt-1">
            Manage context vocabulary and place priors for Pro personalization.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="definitions">Context Vocabulary</TabsTrigger>
            <TabsTrigger value="priors">Place Priors</TabsTrigger>
            <TabsTrigger value="density">Density Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="definitions" className="mt-6">
            <ContextDefinitionEditor />
          </TabsContent>

          <TabsContent value="priors" className="mt-6">
            <PlacePriorEditor />
          </TabsContent>

          <TabsContent value="density" className="mt-6">
            <DensityOverview />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ProContextManagement;
