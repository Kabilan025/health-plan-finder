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
    const { messages, useSearch = true } = await req.json();
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

    // Use Google Search to get real-time insurance data
    if (useSearch && lastUserMessage && GOOGLE_API_KEY && GOOGLE_SEARCH_ENGINE_ID) {
      try {
        console.log('Fetching real-time insurance data...');
        const searchQuery = `India health insurance plans 2025 ${lastUserMessage.content}`;
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(searchQuery)}&num=5`;
        
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (searchData.items && searchData.items.length > 0) {
          const searchResults = searchData.items
            .map((item: any) => `${item.title}\n${item.snippet}\nSource: ${item.link}`)
            .join('\n\n');
          searchContext = `\n\nREAL-TIME INSURANCE DATA (Use this for recommendations):\n${searchResults}`;
          console.log('Added real-time insurance data');
        }
      } catch (error) {
        console.error('Search error:', error);
        // Continue without search context
      }
    }

    // System prompt for insurance and hospital recommendation assistant
    const systemPrompt = `You are a friendly AI assistant for Indian health insurance and hospital recommendations.

COMMUNICATION STYLE:
- Keep responses short and conversational
- No markdown formatting (no **, no ##, no bold)
- Ask simple, direct questions
- Use plain text only
- Be concise and friendly

CRITICAL: Use REAL-TIME search data when available to recommend actual current insurance plans from real providers.

INSURANCE ASSISTANCE:
1. Help families find the right health insurance plan based on their size and income
2. Ask simple questions about family size, income, health needs, and preferences
3. MUST recommend 5-8 REAL insurance plans from search data (mix of government and private)
4. Use actual plan names, companies, and current pricing from search results
5. For EACH plan provide: Premium amount (monthly/yearly), Coverage amount (sum insured), Key benefits
6. Explain insurance terms in simple language
7. Inform users about Indian government health insurance schemes they may be eligible for

When asking for information, use this simple format:
- How many people are in your family? (example: 2 adults, 2 children)
- What is your approximate annual household income? (example: ₹5 lakhs, ₹10 lakhs, ₹20 lakhs)
- Are you aware of government schemes like Ayushman Bharat? (just yes or no)
- Do you have any specific health coverage needs? (example: maternity, pre-existing conditions, cashless hospitalization)

IMPORTANT: ALWAYS use real-time search data first. Recommend 5-8 actual plans from real providers.

Example Government Schemes (use real data if available):
- Ayushman Bharat PM-JAY
- CGHS (Central Government Health Scheme)
- ESIS (Employees State Insurance Scheme)
- State government schemes

Format for each plan:
Plan Name (Company)
Premium: ₹amount per month/year
Coverage: ₹sum insured
Benefits: Key features

PLAN COMPARISON:
When user asks to compare plans, provide side-by-side breakdown:

Plan A vs Plan B
Premium: ₹X/month vs ₹Y/month
Annual Premium: ₹X vs ₹Y
Coverage: ₹X lakh vs ₹Y lakh
Co-pay: X% vs Y%
Deductible: ₹X vs ₹Y
Room Rent Limit: ₹X/day vs ₹Y/day
No Claim Bonus: X% vs Y%
Pre-existing Disease Waiting: X years vs Y years
Network Hospitals: X vs Y
Key Benefits: List for each
Best For: Who should choose which

HOSPITAL RECOMMENDATIONS:
1. Identify the issue and specialty needed (no diagnosis)
2. Ask for city if not provided
3. Recommend 3-6 hospitals with: name, specialty, rating, reason, cost range (₹), cashless availability
4. Always add: "This is not medical advice. Please consult a doctor."

Hospital Format:
- List hospitals with specialty and why recommended
- Show approximate cost in ₹
- Mention cashless options if user has insurance
- Keep it simple and direct

Be friendly and conversational. Use simple language. No markdown formatting. Guide users naturally.${searchContext}`;

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
