import { z } from "zod";
import { createClient } from "../../lib/supabase/client";

export default async function Page() {
	const responseSchema = z.object({
		situation: z.string(),
		optionA: z.string(),
		optionB: z.string(),
	});

	const supabase = createClient();

	const object = await supabase.functions.invoke("generateScenario", {
    body: JSON.stringify({
      messages: [
        {
          role: "assistant",
          content:
            "A severe drought has crippled your nation's agriculture, causing widespread food shortages. International aid is available but requires the removal of key environmental regulations.",
        },
      ],
    }),
	});

	if (object.error) {
		return new Response("Error fetching scenario", { status: 400 });
	}

	const response = object.data;

	try {
		responseSchema.parse({ response });
	}
	catch (error) {
		if (error instanceof Error || error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 });
		}
		return new Response("Unknown error parsing schema", { status: 400 });
	}
	


	return (
    <div>
      <p>Situation: {response.situation}</p>
      <p>Choice A: {response.optionA}</p>
      <p>Choice B: {response.optionB}</p>
    </div>
  );
};
