import { z } from "zod";
import { db } from "./conn.server";

const sessionSchema = z.object({
	userId: z.string().min(1),
	createdAt: z.string().min(1),
	jobDescription: z.string().min(1),
	consumedCredits: z.number().int().min(0),
});

export const sessionWithIdSchema = sessionSchema.extend({ _id: z.string().min(1) });

const sessions = db.collection<z.infer<typeof sessionSchema>>("sessions");

export const addSession = async (session: z.infer<typeof sessionSchema>) => await sessions.insertOne(session);

export const getSessions = async (userId: string) => await sessions.find({ userId }).toArray();
