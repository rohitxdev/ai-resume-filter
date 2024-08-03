import { z } from "zod";
import { db } from "./conn.server";

export const subscriptionPlanSchema = z.enum(["free", "pro"]);

export const roleSchema = z.enum(["user", "admin"]);

export const userSchema = z.object({
	email: z.string().email(),
	passwordHash: z.string().nullish(),
	fullName: z.string().nullish(),
	pictureUrl: z.string().nullish(),
	role: roleSchema,
	creditsLeft: z.number().int(),
	isBanned: z.boolean(),
	passwordResetToken: z.string().nullish(),
});

const userWithIdSchema = userSchema.merge(z.object({ id: z.string() }));

const getUserByIdStmt = db.prepare("SELECT * FROM users WHERE id = ?");
export const getUserById = async (id: string) => {
	return (await getUserByIdStmt.get(Number.parseInt(id, 10))) as z.infer<
		typeof userWithIdSchema
	> | null;
};

const getUserByEmailStmt = db.prepare("SELECT * FROM users WHERE email = ?");
export const getUserByEmail = async (email: string) =>
	(await getUserByEmailStmt.get(email)) as z.infer<
		typeof userWithIdSchema
	> | null;

const createUserStmt = db.prepare(
	"INSERT INTO users (email, passwordHash, fullName, pictureUrl, role, creditsLeft, isBanned, passwordResetToken) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
);
export const createUser = (user: z.infer<typeof userSchema>) => {
	const res = createUserStmt.run(
		user.email,
		user.passwordHash,
		user.fullName,
		user.pictureUrl,
		user.role,
		user.creditsLeft,
		user.isBanned ? 1 : 0,
		user.passwordResetToken,
	);
	return res.lastInsertRowid.toString();
};

const setUserPasswordResetTokenStmt = db.prepare(
	"UPDATE users SET passwordResetToken = ? WHERE id = ?",
);
export const setUserPasswordResetToken = (userId: string, token: string) => {
	const res = setUserPasswordResetTokenStmt.run(token, userId);
	return res.lastInsertRowid.toString();
};

const consumeCreditStmt = db.prepare(
	"UPDATE users SET creditsLeft = creditsLeft - 1 WHERE id = ?",
);
export const consumeCredit = (userId: number) => {
	return consumeCreditStmt.run(userId).lastInsertRowid.toString();
};
