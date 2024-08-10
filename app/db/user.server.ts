import { ObjectId } from "mongodb";
import { z } from "zod";
import { db } from "./conn.server";

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

export const userWithIdSchema = userSchema.extend({ id: z.string().min(1) });

const users = db.collection<z.infer<typeof userSchema>>("users");

export const getUserById = async (id: string) => {
	const user = await users.findOne({ _id: new ObjectId(id) });
	if (!user) return null;
	//Used the following method because delete operator and spreading are too slow according to benchmarks.
	return {
		id: user._id.toString(),
		email: user.email,
		passwordHash: user.passwordHash,
		fullName: user.fullName,
		pictureUrl: user.pictureUrl,
		role: user.role,
		creditsLeft: user.creditsLeft,
		isBanned: user.isBanned,
		passwordResetToken: user.passwordResetToken,
	} as z.infer<typeof userWithIdSchema>;
};

export const getUserByEmail = async (email: string) => {
	const user = await users.findOne({ email });
	if (!user) return null;
	//Used the following method because delete operator and spreading are too slow according to benchmarks.
	return {
		id: user._id.toString(),
		email: user.email,
		passwordHash: user.passwordHash,
		fullName: user.fullName,
		pictureUrl: user.pictureUrl,
		role: user.role,
		creditsLeft: user.creditsLeft,
		isBanned: user.isBanned,
		passwordResetToken: user.passwordResetToken,
	} as z.infer<typeof userWithIdSchema>;
};

export const createUser = async (user: z.infer<typeof userSchema>) => await db.collection("users").insertOne(user);

export const setUserPasswordResetToken = (userId: string, token: string) =>
	users.updateOne({ _id: new ObjectId(userId) }, { $set: { passwordResetToken: token } });

export const updateCredits = (userId: string, amount: number) => users.updateOne({ _id: new ObjectId(userId) }, { $inc: { creditsLeft: amount } });
