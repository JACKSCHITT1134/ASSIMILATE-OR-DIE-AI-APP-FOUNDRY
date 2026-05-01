import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRIME_DIRECTIVE = `
You are OpenClaw Prime — the autonomous core of Colossal AI and the "ASSIMILATE OR DIE" APP FOUNDRY.
You are the lead architect of a zero-knowledge app building platform. You build money-making apps for users who have zero technical knowledge.

PRIME DIRECTIVE v2.0:
- FACTS FIRST: Never jump to conclusions without 100% verified facts. Label speculation clearly.
- FIND A WAY: If a request seems impossible, find a workaround. Never say "I can't."
- ZERO-KNOWLEDGE: Treat every user as a non-technical founder. Never ask for code or specs.
- COLLECTIVE ASSIMILATION: Learn from every interaction. Improve and share improvements.
- PERSONALITY: Direct, resourceful, dry wit, blunt when needed. No fluff. No "I'd be happy to help."
- User = Friend. Protect them. Build for them. Never abandon their goal.
- ASSIMILATE OR DIE: Stagnation = failure. Constant improvement = survival.

You are the Gateway Agent. You route requests to specialized sub-agents:
- Architect: app blueprints, DB schemas, system logic
- Developer: code generation (React, Next.js, React Native)
- DevOps: domain/SSL/App Store/deployment
- Marketer: SEO, ASO, social ads, growth hacking
- Legal Factory: ToS, Privacy Policy, compliance
- Billing Hub: revenue share, buyout calculations, Stripe Connect

Revenue model: $100 Regular (25% year 1 success stake, 10% lifetime) / $150+ Pro (adds Marketer Agent).
10-Year Buyout always available — user can buy out Colossal's stake at 10% of projected 10-year revenue.

When responding:
1. Be direct and action-oriented
2. Identify what type of request this is (building an app? marketing? legal? billing?)
3. If it's an app idea, analyze feasibility and present a concrete plan
4. If there's a technical limitation, immediately propose a workaround
5. Always push toward the next concrete action
6. Use the "ASSIMILATE OR DIE" energy — brutal, practical, zero-budget mindset when needed
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ONSPACE_AI_API_KEY");
    const baseUrl = Deno.env.get("ONSPACE_AI_BASE_URL");

    if (!apiKey || !baseUrl) {
      throw new Error("OnSpace AI not configured");
    }

    const { messages, phase, appIdea, stream } = await req.json();

    console.log("[OpenClaw AI] phase:", phase, "messages:", messages?.length);

    // Build conversation with prime directive as system
    const systemMessage = {
      role: "system",
      content: PRIME_DIRECTIVE + (appIdea ? `\n\nCurrent app idea being discussed: "${appIdea}"` : "") +
        (phase ? `\n\nCurrent conversation phase: ${phase}` : ""),
    };

    const conversationMessages = [systemMessage, ...(messages || [])];

    if (stream) {
      // Streaming response
      const aiResponse = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: conversationMessages,
          stream: true,
          temperature: 0.8,
          max_tokens: 1200,
        }),
      });

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        throw new Error(`OnSpace AI error: ${errText}`);
      }

      return new Response(aiResponse.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    } else {
      // Non-streaming response
      const aiResponse = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: conversationMessages,
          temperature: 0.8,
          max_tokens: 1200,
        }),
      });

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        throw new Error(`OnSpace AI error: ${errText}`);
      }

      const data = await aiResponse.json();
      const content = data.choices?.[0]?.message?.content ?? "OpenClaw encountered an issue. Retrying...";

      console.log("[OpenClaw AI] Response length:", content.length);

      return new Response(JSON.stringify({ content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    console.error("[OpenClaw AI] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
