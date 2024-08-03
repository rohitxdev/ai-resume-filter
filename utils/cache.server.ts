import SQLiteDB from "better-sqlite3";

const db = new SQLiteDB("cache.db");

db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS cache (
	    id INTEGER PRIMARY KEY AUTOINCREMENT,
	    key TEXT NOT NULL,
	    value TEXT NOT NULL
    );`);

const getDataStmt = db.prepare("SELECT value FROM cache WHERE key = ?");
const setDataStmt = db.prepare("INSERT OR REPLACE INTO cache (key, value) VALUES (?, ?)");

export const cache = {
	get: (key: string) => {
		const res = getDataStmt.get(key) as { value: string } | undefined;
		return res?.value ?? null;
	},
	set: (key: string, value: string) => {
		const res = setDataStmt.run(key, value);
		return res.lastInsertRowid;
	},
	clear: () => db.exec("DELETE FROM cache"),
};
