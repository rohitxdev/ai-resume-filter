import crypto from "node:crypto";
import { z } from "zod";

export const LOCALE_UK = "en-GB";

export const getRandomNumber = (min: number, max: number, truncate = true) => {
	const val = min + Math.random() * (max - min);
	return truncate ? Math.trunc(val) : val;
};

export const numFormatter = new Intl.NumberFormat(LOCALE_UK, {
	notation: "compact",
	maximumSignificantDigits: 3,
});

export const actionResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
});

export const scrypt = {
	hash: (text: string) => {
		const salt = crypto.randomBytes(32).toString("base64");
		const hash = crypto.scryptSync(text, salt, 64).toString("base64");
		return `${hash}${salt}`;
	},
	verify: (text: string, hash: string) => {
		return crypto.timingSafeEqual(
			crypto.scryptSync(text, hash.slice(-44), 64),
			Buffer.from(hash, "base64"),
		);
	},
} as const;

// export const aes = {
// 	encrypt: (text: string, secretKey: string) => {
// 		const key = crypto.pbkdf2Sync(secretKey, "salt", 200000, 32, "sha256");
// 		const iv = crypto.randomBytes(16);
// 		const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
// 		return Buffer.concat([iv, cipher.update(text, "utf8"), cipher.final()]).toString("base64");
// 	},
// 	decrypt: (cipherText: string, secretKey: string) => {
// 		const buffer = Buffer.from(cipherText, "base64");
// 		const iv = buffer.subarray(0, 16);
// 		const cipher = buffer.subarray(16);
// 		const key = crypto.pbkdf2Sync(secretKey, "salt", 200000, 32, "sha256");
// 		const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
// 		return Buffer.concat([decipher.update(cipher), decipher.final()]).toString("utf8");
// 	},
// } as const;
