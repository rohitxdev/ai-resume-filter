import SQLiteDB from "better-sqlite3";

const db = new SQLiteDB("app.db");

// db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        passwordHash TEXT,
        fullName TEXT,
        pictureUrl TEXT,
        role TEXT NOT NULL,
        creditsLeft INTEGER NOT NULL,
        isBanned INTEGER NOT NULL,
        passwordResetToken TEXT
    );
`);

export { db };
