import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
      .select("first_name, city, interests")
      .eq("couple_id", couple_id);

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ error: "No profiles found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build context for AI
    const profileSummaries = profiles.map((p, i) => 
      `Partner ${i + 1}: ${p.first_name || 'Unknown'}, based in ${p.city || 'unknown location'}, interests: ${(p.interests || []).join(', ') || 'none specified'}`
    ).join('\n');

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

Available interest IDs: dinner-parties, game-nights, double-dates, happy-hours, book-clubs, hiking, biking, camping, beach-days, picnics, trying-restaurants, cooking-together, wine-tasting, brewery-hopping, coffee-exploring, concerts, museums, theater, art-galleries, live-comedy, yoga, fitness-classes, spa-days, meditation, board-games, trivia-nights, escape-rooms, bowling, mini-golf`
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
