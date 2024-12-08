import { createClient } from "jsr:@supabase/supabase-js@2";
import { Database } from "../_shared/database.types.ts";
import { CoreMessage } from "npm:ai";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { generateObject } from "npm:ai";
import { z } from "npm:zod";
import { createAnthropic } from "npm:@ai-sdk/anthropic";

const SYSTEMPROMPT =
  "Create a brief current event scenario (2-3 sentences) for a country leadership game. The user is the leader of a country, that is going downhill. Then provide exactly 2 response options, each between 1-4 words (these should be SUPER short). The response options should present different approaches to handling the situation. The below scenarios are the previous scenarios, Genereate the NEXT scenario based on the previous scenario";
const ANTHROPIC_MODEL = "claude-3-5-sonnet-20241022";

Deno.serve(async (req) => {
  try {
    const supabase = createClient<Database>(
      Deno.env.get("URL") ?? "",
      Deno.env.get("SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: `Bearer ${Deno.env.get("SERVICE_ROLE_KEY")}`,
          },
        },
      },
    );

    const { data, error } = await supabase.rpc("get_linked_rows", {
      start_id: 5,
    });

    if (error) {
      throw error;
    }

    const prevuisScenarios: CoreMessage[] = data?.flatMap((d) => {
      const content = d.content as { text: string } | null;

      const assistantMsg: CoreMessage = {
        role: "assistant",
        content: content?.text ?? "",
      };
      if (d.leading_choice != null) {
        return [{ role: "user", content: d.leading_choice }, assistantMsg];
      } else {
        return [assistantMsg];
      }
    });

    const choices =
      (await supabase.from("cards").select("id, leading_choice").eq(
        "parent",
        5,
      )).data;

    const result = await Promise.all(
      choices?.map(async ({ id, leading_choice }) => {
        const pMsgs: CoreMessage[] = [...prevuisScenarios, {
          role: "user",
          content: leading_choice?.toString() ?? "",
        }];
        console.log(id);
        const r = await generateScenario(pMsgs);
        console.log(r);
        return r;
      }) ?? [],
    );

    return new Response(
      JSON.stringify({
        data: [
          result,
        ],
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500 });
  }
});

async function generateScenario(messages: CoreMessage[]) {
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!ANTHROPIC_API_KEY) {
    throw new Error("Invalid config");
  }
  const anthropic = createAnthropic({ apiKey: ANTHROPIC_API_KEY });
  const object = await generateObject({
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
  console.log(object);
  return object;
}
