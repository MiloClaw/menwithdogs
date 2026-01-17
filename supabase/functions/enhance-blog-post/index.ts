import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, body, city_name, city_id } = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Enhancing blog post:', { title, bodyLength: body.length, city_name, city_id });

    const systemPrompt = `You are an SEO content assistant for MainStreetIRL, a place-centric platform helping people discover real-world venues and neighborhoods for genuine connection.

Given a blog post title and body content, generate optimized fields.

Voice guidelines:
- Warm but not cheesy
- Grounded, not performative  
- Focus on place and connection, not identity performance
- Calm, helpful, trustworthy

Output requirements:
- slug: lowercase, hyphens only, max 60 chars, include SEO keywords from title
- excerpt: 150-200 characters, compelling hook for social sharing cards
- meta_description: 150-160 characters, search-optimized, distinct from excerpt
- formatted_body: Format for optimal mobile reading UX:
  * Use ## for main sections, ### for subsections (never use #)
  * Keep paragraphs SHORT - 2-4 sentences max for mobile readability
  * Add blank lines between paragraphs for visual breathing room
  * Use **bold** for venue/business names on FIRST mention only
  * Convert lists of 3+ items to bullet points with - prefix
  * Use > blockquotes for notable quotes or key insights
  * Add transition sentences between sections for smooth reading flow
  * Break up dense text - no wall-of-text paragraphs
- suggested_places: Extract ALL business names, venue names, restaurant names, bar names, cafe names, or specific location names mentioned in the text. Be thorough - include every place mentioned even if just briefly. Include context about why it's mentioned.
- reading_time_minutes: estimate based on ~200 words per minute
- social_title: shorter punchy version of title for OG tags, max 60 chars
- cover_image_alt: descriptive alt text for accessibility based on city/topic context`;

    const userPrompt = `Please enhance this blog post for SEO and optimal reading experience.

Title: ${title}
${city_name ? `City/Region: ${city_name}` : ''}

Body Content:
${body}

CRITICAL: 
1. Format the body content for the best mobile reading experience - short paragraphs, clear sections, good visual hierarchy.
2. Extract ALL business/venue/restaurant/bar/cafe names mentioned in the body text for the suggested_places array. Be thorough - even brief mentions count.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'enhance_blog_post',
              description: 'Generate SEO-optimized fields and extract place mentions from a blog post',
              parameters: {
                type: 'object',
                properties: {
                  slug: {
                    type: 'string',
                    description: 'URL-friendly slug, lowercase with hyphens, max 60 chars'
                  },
                  excerpt: {
                    type: 'string',
                    description: 'Compelling 150-200 character summary for social cards'
                  },
                  meta_description: {
                    type: 'string',
                    description: 'SEO meta description, 150-160 characters'
                  },
                  formatted_body: {
                    type: 'string',
                    description: 'Body content formatted with proper markdown'
                  },
                  suggested_places: {
                    type: 'array',
                    description: 'Business/venue/restaurant/bar names mentioned in the body',
                    items: {
                      type: 'object',
                      properties: {
                        name: { 
                          type: 'string', 
                          description: 'Exact business name as mentioned in the text' 
                        },
                        context: { 
                          type: 'string', 
                          description: 'Brief context about why this place is mentioned (1 sentence)' 
                        }
                      },
                      required: ['name']
                    }
                  },
                  reading_time_minutes: {
                    type: 'number',
                    description: 'Estimated reading time in minutes based on word count'
                  },
                  social_title: {
                    type: 'string',
                    description: 'Shorter title for social sharing, max 60 chars'
                  },
                  cover_image_alt: {
                    type: 'string',
                    description: 'Descriptive alt text for cover image'
                  }
                },
                required: ['slug', 'excerpt', 'meta_description', 'formatted_body']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'enhance_blog_post' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'enhance_blog_post') {
      console.error('Unexpected AI response structure:', JSON.stringify(data));
      throw new Error('Invalid AI response structure');
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log('Enhanced content generated:', {
      slugLength: result.slug?.length,
      excerptLength: result.excerpt?.length,
      metaLength: result.meta_description?.length,
      bodyLength: result.formatted_body?.length,
      suggestedPlacesCount: result.suggested_places?.length || 0
    });

    // If city_id provided, try to match suggested places against directory
    if (city_id && result.suggested_places?.length > 0) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Get the city name to match places
        const { data: cityData } = await supabase
          .from('cities')
          .select('name')
          .eq('id', city_id)
          .single();

        if (cityData?.name) {
          // Fetch places for this city
          const { data: cityPlaces } = await supabase
            .from('places')
            .select('id, name, city')
            .eq('city', cityData.name)
            .eq('status', 'approved');

          if (cityPlaces && cityPlaces.length > 0) {
            // Match suggested places to directory
            result.suggested_places = result.suggested_places.map((sp: { name: string; context?: string }) => {
              const normalizedSearch = sp.name.toLowerCase().trim();
              
              // Try exact match first
              let match = cityPlaces.find(p => 
                p.name.toLowerCase().trim() === normalizedSearch
              );
              
              // Try partial match if no exact match
              if (!match) {
                match = cityPlaces.find(p => 
                  p.name.toLowerCase().includes(normalizedSearch) ||
                  normalizedSearch.includes(p.name.toLowerCase())
                );
              }
              
              return {
                ...sp,
                place_id: match?.id || null,
                matched_name: match?.name || null
              };
            });

            const matchCount = result.suggested_places.filter((p: any) => p.place_id).length;
            console.log(`Matched ${matchCount}/${result.suggested_places.length} places to directory`);
          }
        }
      } catch (matchError) {
        console.error('Error matching places:', matchError);
        // Continue without matches - don't fail the request
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error enhancing blog post:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
