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
    const { title, body, city_name, city_id, location_type, geo_area_id } = await req.json();

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

    console.log('Enhancing blog post:', { title, bodyLength: body.length, city_name, city_id, location_type, geo_area_id });

    const systemPrompt = `You are an SEO content assistant for ThickTimber, a place-centric platform helping people discover real-world venues and neighborhoods for genuine connection.

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
  * Add TWO blank lines between paragraphs for visual breathing room on mobile
  * Use **bold** for venue/business names on FIRST mention only
  * Convert lists of 3+ items to bullet points with - prefix
  * Use > blockquotes for notable quotes or key insights
  * Add transition sentences between sections for smooth reading flow
  * Break up dense text - no wall-of-text paragraphs
  * Add a blank line before and after every heading
  * Add a blank line before and after every list
- suggested_places: Extract ALL specific business names mentioned. This includes restaurants, bars, cafes, hotels, shops, venues, clubs, theaters, galleries, parks, or any named establishment. Even a brief mention counts. DO NOT include neighborhoods or districts - only named businesses.
- mentioned_areas: Extract ALL neighborhoods, districts, areas, or regions mentioned. Examples: "Oak Lawn", "Bishop Arts District", "Lower Greenville", "Uptown". These are NOT businesses, they are geographic areas within the city.
- reading_time_minutes: estimate based on ~200 words per minute
- social_title: shorter punchy version of title for OG tags, max 60 chars
- cover_image_alt: descriptive alt text for accessibility based on city/topic context`;

    const userPrompt = `Please enhance this blog post for SEO and optimal reading experience.

Title: ${title}
${city_name ? `City/Region: ${city_name}` : ''}

Body Content:
${body}

CRITICAL INSTRUCTIONS:
1. Format the body content for the best mobile reading experience - short paragraphs, clear sections, good visual hierarchy. Add extra blank lines between paragraphs.
2. For suggested_places: Extract ONLY specific business names (restaurants, bars, shops, venues, etc). NOT neighborhoods or districts.
3. For mentioned_areas: Extract ALL neighborhoods, districts, or areas mentioned (e.g., "Oak Lawn", "Bishop Arts District"). These are geographic areas, not businesses.
4. Be thorough - even brief mentions of either businesses or areas should be included.`;

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
                    description: 'Specific business/venue/restaurant/bar/shop names mentioned. NOT neighborhoods.',
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
                  mentioned_areas: {
                    type: 'array',
                    description: 'Neighborhoods, districts, or geographic areas mentioned in the body',
                    items: {
                      type: 'object',
                      properties: {
                        name: { 
                          type: 'string', 
                          description: 'Name of the neighborhood or district' 
                        },
                        context: { 
                          type: 'string', 
                          description: 'How this area is described or referenced' 
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
      suggestedPlacesCount: result.suggested_places?.length || 0,
      mentionedAreasCount: result.mentioned_areas?.length || 0
    });

    // If city_id or geo_area_id provided, try to match suggested places and find places in mentioned areas
    const hasLocationContext = city_id || geo_area_id;
    if (hasLocationContext) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        let cityNames: string[] = [];

        if (location_type === 'metro' && geo_area_id) {
          // For metro areas, get all cities within the metro
          const { data: metroCities } = await supabase
            .from('cities')
            .select('name')
            .eq('status', 'launched');
          
          // Filter cities that belong to this geo area (via geo_areas relationship)
          // For now, fetch places across all launched cities and filter by metro
          cityNames = metroCities?.map(c => c.name) || [];
          console.log('Metro mode: searching across cities:', cityNames);
        } else if (city_id) {
          // For single city, get just that city's name
          const { data: cityData } = await supabase
            .from('cities')
            .select('name')
            .eq('id', city_id)
            .single();
          
          if (cityData?.name) {
            cityNames = [cityData.name];
          }
        }

        if (cityNames.length > 0) {
          // Fetch places for the relevant cities
          const { data: cityPlaces } = await supabase
            .from('places')
            .select('id, name, city, formatted_address, primary_category')
            .in('city', cityNames)
            .eq('status', 'approved');

          if (cityPlaces && cityPlaces.length > 0) {
            // Match suggested places to directory
            if (result.suggested_places?.length > 0) {
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

            // Find places in mentioned areas (neighborhoods)
            if (result.mentioned_areas?.length > 0) {
              const areaRelatedPlaces: any[] = [];
              
              for (const area of result.mentioned_areas) {
                const areaName = area.name.toLowerCase().trim();
                
                // Find places whose address contains this neighborhood name
                const matchingPlaces = cityPlaces.filter(p => 
                  p.formatted_address?.toLowerCase().includes(areaName)
                ).slice(0, 5); // Limit to 5 per area
                
                if (matchingPlaces.length > 0) {
                  areaRelatedPlaces.push({
                    area_name: area.name,
                    area_context: area.context,
                    places: matchingPlaces.map(p => ({
                      id: p.id,
                      name: p.name,
                      primary_category: p.primary_category
                    }))
                  });
                }
              }
              
              result.area_related_places = areaRelatedPlaces;
              console.log(`Found ${areaRelatedPlaces.reduce((sum, a) => sum + a.places.length, 0)} places in ${areaRelatedPlaces.length} mentioned areas`);
            }
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
