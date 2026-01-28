// Trail Blazer context type definitions and helpers

export interface ContextType {
  id: string;
  key: string;
  label: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

// Default context types matching database seed values
export const DEFAULT_CONTEXT_TYPES: Record<string, { label: string; description: string }> = {
  seasonal: {
    label: 'Seasonal considerations',
    description: 'Best times of year, weather patterns, crowd levels',
  },
  access_logistics: {
    label: 'Access or logistics notes',
    description: 'Parking, permits, approach routes, facilities',
  },
  activity_insight: {
    label: 'Activity-specific insight',
    description: 'Difficulty, gear requirements, technique tips',
  },
  planning: {
    label: 'Planning considerations',
    description: 'Day trips vs overnight, group size, time estimates',
  },
  safety_conditions: {
    label: 'Safety or conditions awareness',
    description: 'Hazards, current conditions, preparedness',
  },
};

export function getContextTypeLabel(key: string): string {
  return DEFAULT_CONTEXT_TYPES[key]?.label || key;
}

export function getContextTypeDescription(key: string): string | null {
  return DEFAULT_CONTEXT_TYPES[key]?.description || null;
}

// Submission status helpers
export type SubmissionStatus = 'pending' | 'approved' | 'needs_revision' | 'declined';

export const SUBMISSION_STATUS_CONFIG: Record<SubmissionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'outline' },
  approved: { label: 'Approved', variant: 'default' },
  needs_revision: { label: 'Needs Revision', variant: 'secondary' },
  declined: { label: 'Declined', variant: 'destructive' },
};
