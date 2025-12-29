import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Valid interest IDs from the interests table
const VALID_INTEREST_IDS = [
  'double-dates', 'dinner-parties', 'game-nights', 'happy-hours', 'book-clubs', 'potlucks',
  'hiking', 'camping', 'beach-days', 'biking', 'kayaking', 'picnics',
  'trying-restaurants', 'cooking-together', 'wine-tasting', 'craft-beer', 'craft-coffee', 'farmers-markets',
  'live-music', 'live-comedy', 'theater', 'museums', 'movies', 'trivia-nights',
  'yoga', 'spa-days', 'meditation',
  'board-games', 'bowling', 'escape-rooms'
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { couple_id } = await req.json();

    if (!couple_id) {
      return new Response(JSON.stringify({ error: "Missing couple_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user belongs to this couple
    const { data: memberProfile } = await supabase
      .from("member_profiles")
      .select("*")
      .eq("user_id", user.id)
      .eq("couple_id", couple_id)
      .maybeSingle();

    if (!memberProfile) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch both member profiles
    const { data: profiles } = await supabase
      .from("member_profiles")
      .select("user_id, first_name, city")
      .eq("couple_id", couple_id);

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ error: "No profiles found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch member interests from join table
    const userIds = profiles.map(p => p.user_id);
    const { data: memberInterests } = await supabase
      .from("member_interests")
      .select("user_id, interest_id")
      .in("user_id", userIds);

    // Fetch interest labels
    const interestIds = [...new Set(memberInterests?.map(mi => mi.interest_id) || [])];
    let interestLabelsMap = new Map<string, string>();
    
    if (interestIds.length > 0) {
      const { data: interests } = await supabase
        .from("interests")
        .select("id, label")
        .in("id", interestIds);
      
      interests?.forEach(i => interestLabelsMap.set(i.id, i.label));
    }

    // Build member interests map
    const memberInterestsMap = new Map<string, string[]>();
    memberInterests?.forEach(mi => {
      const existing = memberInterestsMap.get(mi.user_id) || [];
      const label = interestLabelsMap.get(mi.interest_id);
      if (label) {
        existing.push(label);
      }
      memberInterestsMap.set(mi.user_id, existing);
    });

    // Build context for AI
    const profileSummaries = profiles.map((p, i) => {
      const interests = memberInterestsMap.get(p.user_id) || [];
      return `Partner ${i + 1}: ${p.first_name || 'Unknown'}, based in ${p.city || 'unknown location'}, interests: ${interests.join(', ') || 'none specified'}`;
    }).join('\n');

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You help couples create their shared profile for a social platform connecting couples with other couples.

Your tone: Calm, confident, reflective. Like a thoughtful friend who gets relationships.
Avoid: Dating clichés, emojis, excessive enthusiasm, generic phrases.

Generate:
1. A display name suggestion (e.g., "Mike & Sarah" or a fun couple nickname)
2. A short "About Us" paragraph (2-3 sentences, warm but not cheesy)
3. 3-5 shared interests based on their individual interests

Output JSON only:
{
  "display_name": "...",
  "about_us": "...",
  "shared_interests": ["interest-id-1", "interest-id-2", ...]
}

Available interest IDs (you MUST use only these exact IDs): ${VALID_INTEREST_IDS.join(', ')}`
          },
          {
            role: "user",
            content: `Generate a couple profile based on:\n\n${profileSummaries}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error("AI generation failed");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content from AI");
    }

    // Parse JSON from response
    let generated;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generated = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    // Validate that generated interests are valid IDs
    if (generated.shared_interests) {
      generated.shared_interests = generated.shared_interests.filter(
        (id: string) => VALID_INTEREST_IDS.includes(id)
      );
    }

    // Upsert draft
    const { data: draft, error: upsertError } = await supabase
      .from("couple_profile_drafts")
      .upsert({
        couple_id,
        generated_display_name: generated.display_name,
        generated_about_us: generated.about_us,
        generated_shared_interests: generated.shared_interests,
        is_applied: false,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "couple_id",
      })
      .select()
      .single();

    if (upsertError) throw upsertError;

    console.log("Draft generated for couple:", couple_id);

    return new Response(JSON.stringify({ draft }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in generate-couple-profile:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
