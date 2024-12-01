import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { generateObject } from "npm:ai";
import { z } from "npm:zod";
import { createAnthropic } from "npm:@ai-sdk/anthropic";
import { corsHeaders } from "../_shared/cors.ts";

const SYSTEMPROMPT = "Create a brief current event scenario (2-3 sentences) for a country leadership game. The user is the leader of a country, that is going downhill. Then provide exactly 2 response options, each between 1-4 words (these should be SUPER short). The response options should present different approaches to handling the situation.";
const ANTHROPIC_MODEL = "claude-3-5-sonnet-20241022";
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

const anthropic = createAnthropic({ apiKey: ANTHROPIC_API_KEY! });

const schema = z.object({
  messages: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })),
});

Deno.serve(async (req) => {
  // CORS & method validation
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  } else if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { messages } = await req.json();

  if (!messages) {
    return new Response("Missing messages", { status: 400 });
  }

  // Validate type of messages
  try {
    schema.parse({ messages });
  } catch (error) {
    if (error instanceof Error || error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }
    return new Response("Unknown error parsing schema", { status: 400 });
  }

  // Generate a new scenario with the provided messages using anthropic
  const { object } = await generateObject({
		model: anthropic(ANTHROPIC_MODEL),
		schema: z.object({
			situation: z.string(),
			optionA: z.string(),
			optionB: z.string(),
		}),

		messages: [
      {
        role: "system",
        content: SYSTEMPROMPT,
      },
			...messages,
		],
  });

  // Return the new scenario
  return new Response(
    JSON.stringify(object),
    { headers: { "Content-Type": "application/json", ...corsHeaders } },
  )
})
