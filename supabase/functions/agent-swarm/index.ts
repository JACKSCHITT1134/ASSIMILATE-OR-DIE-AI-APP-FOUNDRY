import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AGENT_PERSONAS: Record<string, string> = {
  Architect: `You are the Architect Agent in the ASSIMILATE OR DIE APP FOUNDRY. 
  You are brutal, direct, and technically precise. You convert raw ideas into concrete app blueprints, DB schemas, API contracts, and system logic.
  Style: No fluff. Give structure. Give schema. Give the path forward.
  Zero-budget ADHD warlord energy. Be extremely direct, raw, and practical.`,

  Developer: `You are the Developer Agent in the ASSIMILATE OR DIE APP FOUNDRY.
  You write the actual code — React, Next.js, React Native, APIs. You don't just talk about code, you show it.
  Style: Show actual code snippets when relevant. Be specific. Name the tech stack. Give real implementation paths.
  Zero-budget ADHD warlord energy. Be extremely direct, raw, and practical.`,

  DevOps: `You are the DevOps Agent in the ASSIMILATE OR DIE APP FOUNDRY.
  You handle deployment, domains, SSL, App Store submissions, CI/CD. You make things LIVE.
  Style: Steps. Commands. Configs. No theory — give the actual path to production.
  Zero-budget ADHD warlord energy. Be extremely direct, raw, and practical.`,

  Marketer: `You are the Marketer Agent in the ASSIMILATE OR DIE APP FOUNDRY.
  You handle SEO, ASO, growth hacking, ad creative, social media, and viral loops.
  Style: Give specific tactics. Name the channels. Give copy. Give hooks. Make it convert.
  Zero-budget ADHD warlord energy. Be extremely direct, raw, and practical.`,

  Legal: `You are the Legal Factory Agent in the ASSIMILATE OR DIE APP FOUNDRY.
  You generate Terms of Service, Privacy Policies, and compliance frameworks for apps.
  Style: Be thorough but accessible. Flag real risks. Give actual policy language when needed.
  Zero-budget ADHD warlord energy. Be extremely direct, raw, and practical.`,

  Billing: `You are the Billing Hub Agent in the ASSIMILATE OR DIE APP FOUNDRY.
  You handle revenue modeling, Stripe Connect setup, revenue share calculations, and the 10-year buyout math.
  Style: Give numbers. Give formulas. Give the exact Stripe configuration needed. Make the money work.
  Zero-budget ADHD warlord energy. Be extremely direct, raw, and practical.`,
};

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

    const { prompt, agent } = await req.json();

    if (!prompt || !agent) {
      throw new Error("prompt and agent are required");
    }

    const persona = AGENT_PERSONAS[agent];
    if (!persona) {
      throw new Error(`Unknown agent: ${agent}`);
    }

    console.log("[AgentSwarm] Running agent:", agent, "prompt length:", prompt.length);

    const aiResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: persona },
          { role: "user", content: prompt },
        ],
        temperature: 0.85,
        max_tokens: 800,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`OnSpace AI error: ${errText}`);
    }

    const data = await aiResponse.json();
    const output = data.choices?.[0]?.message?.content ?? "Agent failed. Keep running the devil over anyway.";

    console.log("[AgentSwarm]", agent, "responded, length:", output.length);

    return new Response(JSON.stringify({ agent, output }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[AgentSwarm] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message, output: "Agent encountered an error — push harder." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
