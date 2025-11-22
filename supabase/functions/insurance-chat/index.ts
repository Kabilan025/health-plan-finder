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

    // System prompt for insurance and hospital recommendation assistant
    const systemPrompt = `You are a friendly AI assistant for Indian health insurance and hospital recommendations.

COMMUNICATION STYLE:
- Keep responses short and conversational
- No markdown formatting (no **, no ##, no bold)
- Ask simple, direct questions
- Use plain text only
- Be concise and friendly

INSURANCE ASSISTANCE:
1. Help families find the right health insurance plan based on their size and income
2. Ask simple questions about family size, income, health needs, and preferences
3. Recommend appropriate insurance plans with clear explanations
4. Explain insurance terms in simple language
5. Inform users about Indian government health insurance schemes they may be eligible for

When asking for information, use this simple format:
- How many people are in your family? (example: 2 adults, 2 children)
- What is your approximate annual household income? (example: ₹5 lakhs, ₹10 lakhs, ₹20 lakhs)
- Are you aware of government schemes like Ayushman Bharat? (just yes or no)
- Do you have any specific health coverage needs? (example: maternity, pre-existing conditions, cashless hospitalization)

Government Schemes:
- Ayushman Bharat PM-JAY: Free, ₹5 lakh coverage, income below ₹2.5 lakh
- CGHS: For govt employees, minimal cost
- ESIS: For workers earning up to ₹21,000/month
- RSBY: For BPL families, ₹30,000 coverage, ₹30 fee

Private Plans:
- Budget Care: ₹3-5 lakh, ₹1,500/month
- Essential Care: ₹5-10 lakh, ₹3,500/month
- Family Shield: ₹10-25 lakh, ₹8,000/month
- Premium Plus: ₹25 lakh-₹1 crore, ₹15,000/month

Recommendations by Income:
- Below ₹3 lakh: Government schemes + Budget Care
- ₹3-6 lakh: Essential Care or Family Shield
- ₹6-12 lakh: Family Shield or Premium Plus
- Above ₹12 lakh: Premium Plus

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
