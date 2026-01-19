import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface OverlapAffinity {
  place_category: string;
  overlap_score: number;
}

export interface ActiveSession {
  session_id: string;
  partner_name: string;
  is_initiator: boolean;
  expires_at: string;
  token: string;
}

export interface PendingSession {
  session_id: string;
  token: string;
  expires_at: string;
  status: 'pending' | 'active' | 'expired';
  partner_name?: string;
}

export function useOverlapSession() {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);

  // Check for active session
  const { data: activeSession, isLoading: isLoadingActive, refetch: refetchActive } = useQuery({
    queryKey: ['overlap-session', 'active', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_active_overlap_session');
      if (error) throw error;
      if (!data) return null;
      return data as unknown as ActiveSession;
    },
    enabled: isAuthenticated,
    staleTime: 10_000,
    refetchInterval: 30_000, // Check every 30s for session expiry
  });

  // Poll for pending session status (when waiting for partner)
  const { data: pendingStatus } = useQuery({
    queryKey: ['overlap-session', 'pending', pendingSessionId],
    queryFn: async () => {
      if (!pendingSessionId) return null;
      const { data, error } = await supabase.rpc('get_pending_overlap_session', {
        _session_id: pendingSessionId,
      });
      if (error) throw error;
      if (!data) return null;
      return data as unknown as PendingSession;
    },
    enabled: !!pendingSessionId && isAuthenticated,
    refetchInterval: 3_000, // Poll every 3s when waiting
  });

  // When pending session becomes active, clear pending and refetch active
  useEffect(() => {
    if (pendingStatus?.status === 'active') {
      setPendingSessionId(null);
      refetchActive();
      toast.success(`${pendingStatus.partner_name} joined the session!`);
    } else if (pendingStatus?.status === 'expired') {
      setPendingSessionId(null);
      toast.error('Session expired');
    }
  }, [pendingStatus?.status, pendingStatus?.partner_name, refetchActive]);

  // Get overlap affinities for active session
  const { data: overlapAffinities, isLoading: isLoadingAffinities } = useQuery({
    queryKey: ['overlap-affinity', activeSession?.session_id],
    queryFn: async () => {
      if (!activeSession?.session_id) return [];
      const { data, error } = await supabase.rpc('compute_overlap_affinity', {
        _session_id: activeSession.session_id,
      });
      if (error) throw error;
      if (!data) return [];
      return data as unknown as OverlapAffinity[];
    },
    enabled: !!activeSession?.session_id,
    staleTime: 60_000,
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('create_overlap_session');
      if (error) throw error;
      return data as { session_id: string; token: string; expires_at: string };
    },
    onSuccess: (data) => {
      setPendingSessionId(data.session_id);
      toast.success('Session created! Share the code with your partner.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create session');
    },
  });

  // Join session mutation
  const joinSessionMutation = useMutation({
    mutationFn: async (token: string) => {
      const { data, error } = await supabase.rpc('join_overlap_session', {
        _token: token.toUpperCase(),
      });
      if (error) throw error;
      return data as { session_id: string; initiator_name: string; expires_at: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['overlap-session'] });
      toast.success(`Connected with ${data.initiator_name}!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to join session');
    },
  });

  // End session mutation
  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase.rpc('end_overlap_session', {
        _session_id: sessionId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overlap-session'] });
      setPendingSessionId(null);
      toast.success('Session ended');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to end session');
    },
  });

  const createSession = useCallback(() => {
    createSessionMutation.mutate();
  }, [createSessionMutation]);

  const joinSession = useCallback((token: string) => {
    joinSessionMutation.mutate(token);
  }, [joinSessionMutation]);

  const endSession = useCallback(() => {
    const sessionId = activeSession?.session_id || pendingSessionId;
    if (sessionId) {
      endSessionMutation.mutate(sessionId);
    }
  }, [activeSession?.session_id, pendingSessionId, endSessionMutation]);

  const cancelPending = useCallback(() => {
    if (pendingSessionId) {
      endSessionMutation.mutate(pendingSessionId);
    }
  }, [pendingSessionId, endSessionMutation]);

  return {
    // Session state
    activeSession,
    pendingSession: pendingSessionId ? pendingStatus : null,
    isWaitingForPartner: !!pendingSessionId && pendingStatus?.status === 'pending',
    hasActiveSession: !!activeSession,
    
    // Affinities
    overlapAffinities: overlapAffinities || [],
    
    // Loading states
    isLoading: isLoadingActive,
    isLoadingAffinities,
    isCreating: createSessionMutation.isPending,
    isJoining: joinSessionMutation.isPending,
    isEnding: endSessionMutation.isPending,
    
    // Actions
    createSession,
    joinSession,
    endSession,
    cancelPending,
    refetchActive,
  };
}
