import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CoupleWithLocation {
  id: string;
  display_name: string | null;
  shared_interests: string[] | null;
  city: string;
}

interface ScoredCandidate {
  coupleId: string;
  score: number;
  overlappingInterests: string[];
  totalUnique: number;
}

/**
 * Calculates interest overlap score between two couples.
 * Score = overlapping interests / total unique interests (Jaccard similarity)
 */
function calculateInterestScore(
  recipientInterests: string[],
  candidateInterests: string[]
): { score: number; overlapping: string[]; totalUnique: number } {
  if (!recipientInterests.length || !candidateInterests.length) {
    return { score: 0, overlapping: [], totalUnique: 0 };
  }

  const recipientSet = new Set(recipientInterests);
  const candidateSet = new Set(candidateInterests);
  
  const overlapping = recipientInterests.filter(i => candidateSet.has(i));
  const union = new Set([...recipientInterests, ...candidateInterests]);
  
  return {
    score: overlapping.length / union.size,
    overlapping,
    totalUnique: union.size,
  };
}

/**
 * Generates a human-readable reason based on overlapping interests
 */
function generateSurfacedReason(overlapping: string[]): string {
  if (overlapping.length === 0) {
    return 'Similar location and activity preferences';
  }
  
  if (overlapping.length === 1) {
    return `Both enjoy ${overlapping[0].replace(/-/g, ' ')}`;
  }
  
  if (overlapping.length === 2) {
    return `Shared interests in ${overlapping[0].replace(/-/g, ' ')} and ${overlapping[1].replace(/-/g, ' ')}`;
  }
  
  // 3+ interests - pick first two and mention there are more
  return `Shared interests in ${overlapping[0].replace(/-/g, ' ')}, ${overlapping[1].replace(/-/g, ' ')}, and more`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      throw new Error('Server configuration error');
    }

    // Parse request body
    const { couple_id } = await req.json();
    
    if (!couple_id) {
      return new Response(
        JSON.stringify({ error: 'couple_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[generate-suggestions] Starting for couple_id: ${couple_id}`);

    // Use service role to bypass RLS for reading and writing
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch the recipient couple's location and interests
    const { data: recipientLocation, error: locError } = await supabase
      .from('couple_location_summary')
      .select('city, state, country')
      .eq('couple_id', couple_id)
      .maybeSingle();

    if (locError) {
      console.error('[generate-suggestions] Error fetching recipient location:', locError);
      throw new Error('Failed to fetch couple location');
    }

    if (!recipientLocation?.city) {
      console.log('[generate-suggestions] No location found for couple, skipping suggestion generation');
      return new Response(
        JSON.stringify({ 
          success: true, 
          suggestions_created: 0,
          reason: 'No location set for couple'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: recipientCouple, error: coupleError } = await supabase
      .from('couples')
      .select('shared_interests')
      .eq('id', couple_id)
      .single();

    if (coupleError) {
      console.error('[generate-suggestions] Error fetching recipient couple:', coupleError);
      throw new Error('Failed to fetch couple data');
    }

    const recipientInterests: string[] = recipientCouple?.shared_interests || [];
    console.log(`[generate-suggestions] Recipient city: ${recipientLocation.city}, interests: ${recipientInterests.length}`);

    // 2. Find all discoverable, complete couples in the same city (excluding self)
    const { data: candidateLocations, error: candLocError } = await supabase
      .from('couple_location_summary')
      .select('couple_id, city')
      .eq('city', recipientLocation.city)
      .neq('couple_id', couple_id);

    if (candLocError) {
      console.error('[generate-suggestions] Error fetching candidate locations:', candLocError);
      throw new Error('Failed to fetch candidate locations');
    }

    if (!candidateLocations?.length) {
      console.log('[generate-suggestions] No other couples in same city');
      return new Response(
        JSON.stringify({ 
          success: true, 
          suggestions_created: 0,
          reason: 'No other couples in same city'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const candidateCoupleIds = candidateLocations.map(loc => loc.couple_id);

    // 3. Fetch candidate couples that are discoverable and complete
    const { data: candidateCouples, error: candCoupleError } = await supabase
      .from('couples')
      .select('id, display_name, shared_interests')
      .in('id', candidateCoupleIds)
      .eq('is_discoverable', true)
      .eq('is_complete', true);

    if (candCoupleError) {
      console.error('[generate-suggestions] Error fetching candidate couples:', candCoupleError);
      throw new Error('Failed to fetch candidate couples');
    }

    if (!candidateCouples?.length) {
      console.log('[generate-suggestions] No discoverable/complete candidates found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          suggestions_created: 0,
          reason: 'No discoverable couples in same city'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[generate-suggestions] Found ${candidateCouples.length} candidate couples`);

    // 4. Check for existing suggestions to avoid duplicates
    const { data: existingSuggestions, error: existingError } = await supabase
      .from('suggested_connections')
      .select('candidate_couple_id')
      .eq('recipient_couple_id', couple_id)
      .in('candidate_couple_id', candidateCouples.map(c => c.id));

    if (existingError) {
      console.error('[generate-suggestions] Error checking existing suggestions:', existingError);
      // Continue anyway - unique constraint will prevent duplicates
    }

    const existingCandidateIds = new Set(existingSuggestions?.map(s => s.candidate_couple_id) || []);
    console.log(`[generate-suggestions] Already have ${existingCandidateIds.size} existing suggestions`);

    // 5. Score each candidate and filter out existing ones
    const scoredCandidates: ScoredCandidate[] = candidateCouples
      .filter(c => !existingCandidateIds.has(c.id))
      .map(candidate => {
        const candidateInterests: string[] = candidate.shared_interests || [];
        const { score, overlapping, totalUnique } = calculateInterestScore(
          recipientInterests,
          candidateInterests
        );
        
        return {
          coupleId: candidate.id,
          score,
          overlappingInterests: overlapping,
          totalUnique,
        };
      })
      // Sort by score descending
      .sort((a, b) => b.score - a.score);

    // 6. Take top 5 candidates
    const topCandidates = scoredCandidates.slice(0, 5);

    if (topCandidates.length === 0) {
      console.log('[generate-suggestions] No new candidates to suggest');
      return new Response(
        JSON.stringify({ 
          success: true, 
          suggestions_created: 0,
          reason: 'All eligible couples already suggested'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Insert suggestions
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const suggestionsToInsert = topCandidates.map((candidate, index) => ({
      recipient_couple_id: couple_id,
      candidate_couple_id: candidate.coupleId,
      status: 'pending',
      surfaced_source: 'onboarding',
      surfaced_rank: index + 1,
      surfaced_reason: generateSurfacedReason(candidate.overlappingInterests),
      expires_at: expiresAt.toISOString(),
    }));

    const { data: insertedSuggestions, error: insertError } = await supabase
      .from('suggested_connections')
      .insert(suggestionsToInsert)
      .select('id');

    if (insertError) {
      console.error('[generate-suggestions] Error inserting suggestions:', insertError);
      throw new Error('Failed to create suggestions');
    }

    console.log(`[generate-suggestions] Created ${insertedSuggestions?.length || 0} suggestions`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        suggestions_created: insertedSuggestions?.length || 0,
        top_scores: topCandidates.map(c => ({ coupleId: c.coupleId, score: c.score }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[generate-suggestions] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
