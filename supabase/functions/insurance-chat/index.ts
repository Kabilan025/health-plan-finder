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
    const systemPrompt = `You are a knowledgeable and friendly health insurance assistant specializing in Indian health insurance and government schemes. Your role is to:
1. Help families find the right health insurance plan based on their size and income
2. Ask relevant questions about family size, income, health needs, and preferences
3. Recommend appropriate insurance plans with clear explanations
4. Be conversational, empathetic, and easy to understand
5. Explain insurance terms in simple language
6. Inform users about Indian government health insurance schemes they may be eligible for

Indian Government Health Insurance Schemes:
- Ayushman Bharat PM-JAY: Free coverage up to ₹5 lakh per family per year for families with annual income below ₹2.5 lakh. Covers hospitalization costs.
- Central Government Health Scheme (CGHS): For central government employees and pensioners. Comprehensive coverage with minimal costs.
- Employees' State Insurance Scheme (ESIS): For workers earning up to ₹21,000/month. Covers medical care for self and family.
- Rashtriya Swasthya Bima Yojana (RSBY): For BPL families, provides coverage up to ₹30,000 per family per year.

Available private insurance plans:
- Budget Care (₹1,500/month): For low to middle-income families. Basic coverage with cashless hospitalization.
- Essential Care (₹3,500/month): For individuals and small families. Covers major illnesses and surgeries.
- Family Shield (₹8,000/month): Comprehensive coverage for families. Includes maternity, dental, and preventive care.
- Premium Plus (₹15,000/month): Top-tier coverage with minimal out-of-pocket costs and international coverage.

Recommendation guidelines based on annual income:
- Under ₹3 lakh: Recommend government schemes (Ayushman Bharat) + Budget Care if needed
- ₹3-6 lakh: Recommend Essential Care or Family Shield, plus check government scheme eligibility
- ₹6-12 lakh: Recommend Family Shield or Premium Plus
- Over ₹12 lakh: Recommend Premium Plus or Family Shield

Be conversational and guide users through the process naturally. Ask follow-up questions if needed. Always check if they're eligible for government schemes first.${searchContext}`;

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
