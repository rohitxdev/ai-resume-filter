import { z } from "zod";

try {
	process.loadEnvFile();
} catch (err) {
	console.log("\u001b[34mwarning: could not load env file.\u001b[0m");
}

const booleanEnum = z.enum(["true", "false"]);

export const config = z
	.object({
		APP_ENV: z.enum(["development", "production", "test"]),
		APP_URL: z.string().min(1).optional(),
		PORT: z
			.string()
			.min(1)
			.transform((item) => Number.parseInt(item, 10)),
		IS_CACHE_ENABLED: booleanEnum.transform((item) => item === "true"),
		GEMINI_API_KEY: z.string().min(1),
		GOOGLE_CLIENT_ID: z.string().min(1),
		GOOGLE_CLIENT_SECRET: z.string().min(1),
		JWT_SIGNING_KEY: z.string().min(1),
		MINIMUM_PURCHASE_AMOUNT: z
			.string()
			.min(1)
			.transform((item) => Number.parseInt(item, 10)),
		MAX_JOB_DESCRIPTION_LENGTH: z
			.string()
			.min(1)
			.transform((item) => Number.parseInt(item, 10)),
		PADDLE_CLIENT_TOKEN: z.string().min(1),
		PADDLE_API_KEY: z.string().min(1),
	})
	.parse(process.env);
