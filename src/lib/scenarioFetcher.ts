"use server";

import { generateObject } from "ai";
import { z } from "zod";

import { anthropic } from "@ai-sdk/anthropic";

export const fetchNextScenario = async (messages: any) => {
	console.log("msg", messages);
	const { object } = await generateObject({
		model: anthropic("claude-3-5-haiku-20241022"),
		schema: z.object({
			situation: z.string(),
			option_a: z.string(),
			option_b: z.string(),
		}),

		messages: [
			{
				role: "system",
				content:
					"Create a brief current event scenario (2-3 sentences) for a country leadership game. The user is the leader of a country, that is going downhill. Then provide exactly 2 response options, each between 1-4 words (these should be SUPER short). The response options should present different approaches to handling the situation.",
			},
			...messages,
			{
				role: "user",
				content:
					"That is what i will do. Generate now the next scenario, and the 2 response options",
			},
		],
	});

	return object;
};
