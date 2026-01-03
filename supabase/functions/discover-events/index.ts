import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiscoveryRequest {
  city: string;
  state?: string;
  time_window_days?: number;
  event_focus?: string[];
  venue_types?: string[];
  custom_context?: string;
}

interface EventCandidate {
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

interface DiscoveryResponse {
  candidates: EventCandidate[];
  meta: {
    city: string;
    state?: string;
    generated_at: string;
    model_used: string;
  };
}

// Rate limiting - simple in-memory tracker (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  entry.count++;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[discover-events] Missing Supabase environment variables');
      throw new Error('Server configuration error');
    }

    if (!lovableApiKey) {
      console.error('[discover-events] Missing LOVABLE_API_KEY');
      throw new Error('AI service not configured');
    }

    // Verify admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting
    if (!checkRateLimit(user.id)) {
      console.log(`[discover-events] Rate limit exceeded for user: ${user.id}`);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Max 5 discoveries per hour.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const body: DiscoveryRequest = await req.json();
    
    if (!body.city) {
      return new Response(
        JSON.stringify({ error: 'City is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[discover-events] Starting discovery for: ${body.city}, ${body.state || ''}`);

    // Build the AI prompt
    const locationStr = body.state ? `${body.city}, ${body.state}` : body.city;
    const timeWindow = body.time_window_days || 30;
    
    const systemPrompt = `You are an expert local event researcher for MainStreetIRL, a platform that helps couples discover real-world social experiences. Your job is to identify REAL, SPECIFIC events that are likely happening in ${locationStr} within the next ${timeWindow} days.

IMPORTANT RULES:
1. Only suggest events that are LIKELY REAL and RECURRING or SCHEDULED
2. Include specific venue names where events would be held
3. Focus on events appealing to couples looking for social experiences
4. Prioritize events that encourage connection and interaction
5. Be specific about dates/times when you can infer them (e.g., "Every Saturday 7pm", "First Friday of month")
6. Do NOT make up fictional events - only suggest plausible events based on common patterns

EVENT TYPES to consider:
- Weekly trivia nights, open mics, karaoke
- Food & drink events (wine tastings, food festivals, brewery tours)
- Arts & culture (gallery openings, museum nights, theater)
- Fitness & wellness (group classes, yoga in the park)
- Community events (farmers markets, street fairs, meetups)
- Entertainment (comedy shows, live music, game nights)

Return 5-10 high-quality event candidates. Quality over quantity.`;

    let userPromptParts = [`Find events worth adding to our directory for couples in ${locationStr}.`];
    
    if (body.event_focus?.length) {
      userPromptParts.push(`Focus areas: ${body.event_focus.join(', ')}`);
    }
    
    if (body.venue_types?.length) {
      userPromptParts.push(`Venue types to prioritize: ${body.venue_types.join(', ')}`);
    }
    
    if (body.custom_context) {
      userPromptParts.push(`Additional context: ${body.custom_context}`);
    }

    const userPrompt = userPromptParts.join('\n\n');

    // Call Lovable AI with tool calling for structured output
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'return_event_candidates',
              description: 'Return a list of event candidates discovered for the specified city.',
              parameters: {
                type: 'object',
                properties: {
                  candidates: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { 
                          type: 'string', 
                          description: 'Event name (e.g., "Trivia Night at The Local Pub")' 
                        },
                        description: { 
                          type: 'string', 
                          description: 'Brief description of the event (1-2 sentences)' 
                        },
                        suggested_date: { 
                          type: 'string', 
                          description: 'When this event occurs (e.g., "Every Tuesday 7pm", "First Friday monthly", "December 15, 2024")' 
                        },
                        venue_name: { 
                          type: 'string', 
                          description: 'Specific venue name where event is held' 
                        },
                        venue_address_hint: { 
                          type: 'string', 
                          description: 'Neighborhood or partial address if known' 
                        },
                        source_hint: { 
                          type: 'string', 
                          description: 'How you know about this event (e.g., "Common weekly event", "Based on venue type")' 
                        },
                        confidence: { 
                          type: 'string', 
                          enum: ['low', 'medium', 'high'],
                          description: 'How confident you are this is a real, active event' 
                        },
                        suggested_event_type: { 
                          type: 'string',
                          enum: ['social', 'cultural', 'food_drink', 'fitness', 'entertainment', 'community', 'educational', 'outdoor', 'seasonal', 'special_interest'],
                          description: 'Primary event category' 
                        },
                        suggested_event_format: { 
                          type: 'string',
                          enum: ['drop_in', 'ticketed', 'reservation_required', 'scheduled_program', 'recurring', 'pop_up', 'series', 'all_day'],
                          description: 'Event format' 
                        },
                        suggested_social_energy: { 
                          type: 'number',
                          minimum: 1,
                          maximum: 5,
                          description: 'Social energy level: 1=quiet/observational, 5=high energy/interactive' 
                        },
                        suggested_cost_type: { 
                          type: 'string',
                          enum: ['free', 'paid', 'optional_spend', 'unknown'],
                          description: 'Cost structure' 
                        }
                      },
                      required: ['name', 'description', 'venue_name', 'confidence', 'suggested_event_type']
                    }
                  }
                },
                required: ['candidates']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'return_event_candidates' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[discover-events] AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'AI rate limit exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service payment required.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('AI service error');
    }

    const aiData = await aiResponse.json();
    console.log('[discover-events] AI response received');

    // Extract candidates from tool call response
    let candidates: EventCandidate[] = [];
    
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        candidates = (parsed.candidates || []).map((c: any) => ({
          name: c.name,
          description: c.description,
          suggested_date: c.suggested_date,
          venue_name: c.venue_name,
          venue_address_hint: c.venue_address_hint,
          source_hint: c.source_hint,
          confidence: c.confidence || 'low',
          suggested_taxonomy: {
            event_type: c.suggested_event_type,
            event_format: c.suggested_event_format,
            social_energy_level: c.suggested_social_energy,
            cost_type: c.suggested_cost_type,
          }
        }));
      } catch (parseError) {
        console.error('[discover-events] Failed to parse AI response:', parseError);
        throw new Error('Failed to parse AI response');
      }
    }

    console.log(`[discover-events] Found ${candidates.length} candidates for ${locationStr}`);

    const response: DiscoveryResponse = {
      candidates,
      meta: {
        city: body.city,
        state: body.state,
        generated_at: new Date().toISOString(),
        model_used: 'google/gemini-2.5-flash'
      }
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[discover-events] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
