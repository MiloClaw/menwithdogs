import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Json } from '@/integrations/supabase/types';

// Overlap score per category
export interface OverlapAffinity {
  place_category: string;
  overlap_score: number;
}

// Session location data
export interface SessionLocation {
  city: string;
  state: string | null;
  lat: number;
  lng: number;
}

// An active session (partner has joined)
export interface ActiveSession {
  session_id: string;
  partner_name: string;
  is_initiator: boolean;
  expires_at: string;
  token: string;
  location_city: string | null;
  location_state: string | null;
  location_lat: number | null;
  location_lng: number | null;
}

// A pending session (waiting for partner)
export interface PendingSession {
  session_id: string;
  token: string;
  expires_at: string;
  status: 'pending' | 'active' | 'expired';
  partner_name?: string;
}

export function useOverlapSession() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);

  // Query for active session
  const { data: activeSession, isLoading: isLoadingActive, refetch: refetchActive } = useQuery({
    queryKey: ['active-overlap-session', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_active_overlap_session');
      if (error) throw error;
      if (!data) return null;
      return data as unknown as ActiveSession;
    },
    enabled: !!user,
    refetchInterval: 5000, // Poll every 5s for partner updates
    staleTime: 2000,
  });

  // Query for pending session status (polls while waiting)
  const { data: pendingSession, isLoading: isLoadingPending } = useQuery({
    queryKey: ['pending-overlap-session', pendingSessionId],
    queryFn: async () => {
      if (!pendingSessionId) return null;
      const { data, error } = await supabase.rpc('get_pending_overlap_session', {
        _session_id: pendingSessionId,
      });
      if (error) throw error;
      if (!data) return null;
      return data as unknown as PendingSession;
    },
    enabled: !!pendingSessionId && !!user,
    refetchInterval: 3000, // Poll every 3s while waiting for partner
    staleTime: 1000,
  });

  // When pending session becomes active, clear pending state and refetch active
  useEffect(() => {
    if (pendingSession?.status === 'active') {
      setPendingSessionId(null);
      refetchActive();
    } else if (pendingSession?.status === 'expired') {
      setPendingSessionId(null);
    }
  }, [pendingSession?.status, refetchActive]);

  // Query for overlap affinities (only when session is active)
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
    staleTime: 30000, // Cache for 30s
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-overlap-session'] });
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
      setPendingSessionId(null);
      queryClient.invalidateQueries({ queryKey: ['active-overlap-session'] });
      queryClient.invalidateQueries({ queryKey: ['pending-overlap-session'] });
    },
  });

  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: async ({
      sessionId,
      city,
      state,
      lat,
      lng,
    }: {
      sessionId: string;
      city: string;
      state: string | null;
      lat: number;
      lng: number;
    }) => {
      const { error } = await supabase.rpc('update_overlap_session_location', {
        _session_id: sessionId,
        _city: city,
        _state: state,
        _lat: lat,
        _lng: lng,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-overlap-session'] });
    },
  });

  // Action callbacks
  const createSession = useCallback(() => {
    createSessionMutation.mutate();
  }, [createSessionMutation]);

  const joinSession = useCallback(
    (token: string) => {
      joinSessionMutation.mutate(token);
    },
    [joinSessionMutation]
  );

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

  const updateLocation = useCallback(
    (location: SessionLocation) => {
      if (activeSession?.session_id) {
        updateLocationMutation.mutate({
          sessionId: activeSession.session_id,
          city: location.city,
          state: location.state,
          lat: location.lat,
          lng: location.lng,
        });
      }
    },
    [activeSession?.session_id, updateLocationMutation]
  );

  // Computed state
  const isWaitingForPartner = !!pendingSessionId && pendingSession?.status === 'pending';
  const hasActiveSession = !!activeSession?.session_id;

  // Get session location if set
  const sessionLocation: SessionLocation | null =
    activeSession?.location_lat && activeSession?.location_lng && activeSession?.location_city
      ? {
          city: activeSession.location_city,
          state: activeSession.location_state,
          lat: activeSession.location_lat,
          lng: activeSession.location_lng,
        }
      : null;

  return {
    // Session state
    activeSession,
    pendingSession: isWaitingForPartner
      ? {
          session_id: pendingSessionId!,
          token: pendingSession?.token || '',
          expires_at: pendingSession?.expires_at || '',
          status: 'pending' as const,
        }
      : null,
    isWaitingForPartner,
    hasActiveSession,
    sessionLocation,

    // Affinity data
    overlapAffinities: overlapAffinities || [],

    // Loading states
    isLoading: isLoadingActive || isLoadingPending,
    isLoadingAffinities,
    isCreating: createSessionMutation.isPending,
    isJoining: joinSessionMutation.isPending,
    isEnding: endSessionMutation.isPending,
    isUpdatingLocation: updateLocationMutation.isPending,

    // Actions
    createSession,
    joinSession,
    endSession,
    cancelPending,
    updateLocation,
    refetchActive,
  };
}
