import { z } from "zod";
import { db } from "./conn.server";

const sessionsSchema = z.object({
	userId: z.number(),
	createdAt: z.string(),
	jobDescription: z.string().nullish(),
	consumedCredits: z.number().int(),
});

const addSessionStmt = db.prepare("INSERT INTO sessions (userId, createdAt, jobDescription, consumedCredits) VALUES (?, ?, ?, ?)");
export const addSession = (session: z.infer<typeof sessionsSchema>) => {
	return addSessionStmt.run(session.userId, session.createdAt, session.jobDescription, session.consumedCredits).lastInsertRowid;
};

const getSessionsStmt = db.prepare("SELECT * FROM sessions WHERE userId = ?");
export const getSessions = (userId: number) => {
	return getSessionsStmt.all(userId) as z.infer<typeof sessionsSchema>[];
};
