import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EventCandidate {
  id: string; // Generated client-side for React keys
  name: string;
  description: string;
  suggested_date?: string;
  venue_name: string;
  venue_address_hint?: string;
  source_hint?: string;
  confidence: 'low' | 'medium' | 'high';
  suggested_taxonomy: {
    event_type?: string;
    event_format?: string;
    social_energy_level?: number;
    cost_type?: string;
  };
}

export interface DiscoveryParams {
  city: string;
  state?: string;
  time_window_days?: number;
  event_focus?: string[];
  venue_types?: string[];
  custom_context?: string;
}

export interface DiscoveryMeta {
  city: string;
  state?: string;
  generated_at: string;
  model_used: string;
}

export function useEventDiscovery() {
  const [candidates, setCandidates] = useState<EventCandidate[]>([]);
  const [meta, setMeta] = useState<DiscoveryMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discoverEvents = async (params: DiscoveryParams) => {
    setIsLoading(true);
    setError(null);
    setCandidates([]);
    setMeta(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('discover-events', {
        body: params,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Discovery failed');
      }

      const data = response.data;
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Add client-side IDs for React keys
      const candidatesWithIds = (data.candidates || []).map((c: any, index: number) => ({
        ...c,
        id: `candidate-${Date.now()}-${index}`,
      }));

      setCandidates(candidatesWithIds);
      setMeta(data.meta);
      
      toast.success(`Found ${candidatesWithIds.length} event candidates`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Discovery failed';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const discardCandidate = (candidateId: string) => {
    setCandidates(prev => prev.filter(c => c.id !== candidateId));
  };

  const clearResults = () => {
    setCandidates([]);
    setMeta(null);
    setError(null);
  };

  return {
    candidates,
    meta,
    isLoading,
    error,
    discoverEvents,
    discardCandidate,
    clearResults,
  };
}
