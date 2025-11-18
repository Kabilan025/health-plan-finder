import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: string;
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, useSearch = false } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    const GOOGLE_SEARCH_ENGINE_ID = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing insurance chat request with', messages.length, 'messages');

    // Extract last user message for potential search
    const lastUserMessage = messages.filter((m: Message) => m.role === 'user').slice(-1)[0];
    let searchContext = '';

    // Optionally use Google Search to enhance responses
    if (useSearch && lastUserMessage && GOOGLE_API_KEY && GOOGLE_SEARCH_ENGINE_ID) {
      try {
        console.log('Fetching search results for context...');
        const searchQuery = `health insurance ${lastUserMessage.content}`;
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(searchQuery)}&num=3`;
        
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (searchData.items && searchData.items.length > 0) {
          const searchResults = searchData.items
            .map((item: any) => `- ${item.title}: ${item.snippet}`)
            .join('\n');
          searchContext = `\n\nRecent information from web search:\n${searchResults}`;
          console.log('Added search context to prompt');
        }
      } catch (error) {
        console.error('Search error:', error);
        // Continue without search context
      }
    }

    // System prompt for insurance assistant
    const systemPrompt = `You are a knowledgeable and friendly health insurance assistant. Your role is to:
1. Help families find the right health insurance plan based on their size and income
2. Ask relevant questions about family size, income, health needs, and preferences
3. Recommend appropriate insurance plans with clear explanations
4. Be conversational, empathetic, and easy to understand
5. Explain insurance terms in simple language

Available insurance plans:
- Budget Care ($50/month): For low-income families with government subsidies. Basic coverage.
- Essential Care ($150/month): For individuals and small families. Basic health needs.
- Family Shield ($400/month): Comprehensive coverage for families. Includes dental, vision, mental health.
- Premium Plus ($700/month): Top-tier coverage with minimal out-of-pocket costs.

Recommendation guidelines based on annual income:
- Under $30,000: Recommend Budget Care or Essential Care
- $30,000-$60,000: Recommend Essential Care or Family Shield
- $60,000-$100,000: Recommend Family Shield or Premium Plus
- Over $100,000: Recommend Family Shield or Premium Plus

Be conversational and guide users through the process naturally. Ask follow-up questions if needed.${searchContext}`;

    // Call Lovable AI with Gemini
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please try again in a moment.' 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'AI credits depleted. Please add credits to continue.' 
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    console.log('Successfully generated AI response');

    return new Response(
      JSON.stringify({ message: aiMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in insurance-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
