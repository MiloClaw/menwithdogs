import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, body, city_name } = await req.json();

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

    console.log('Enhancing blog post:', { title, bodyLength: body.length, city_name });

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
- formatted_body: proper markdown with ## headers (not #), **bold** for emphasis, - bullet lists where appropriate, clean paragraph breaks`;

    const userPrompt = `Please enhance this blog post for SEO and readability.

Title: ${title}
${city_name ? `City: ${city_name}` : ''}

Body Content:
${body}`;

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
              description: 'Generate SEO-optimized fields for a blog post',
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
      bodyLength: result.formatted_body?.length
    });

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
