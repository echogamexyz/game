import { generateObject } from "ai";
import { z } from "zod";

import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
const { text } = await generateText({
	model: anthropic("claude-3-opus-20240229"),
	prompt: "What is love?",
});

const { object } = await generateObject({
	model: anthropic("claude-3-opus-20240229"),
	schema: z.object({
		recipe: z.object({
			name: z.string(),
			ingredients: z.array(z.object({ name: z.string(), amount: z.string() })),
			steps: z.array(z.string()),
		}),
	}),
	prompt: "Generate a lasagna recipe.",
});

console.log(object);

const page = () => {
	return (
		<div>
			{text}

			{JSON.stringify(object)}
		</div>
	);
};

export default page;
