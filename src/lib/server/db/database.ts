import { env } from "$env/dynamic/private";
import Database from "better-sqlite3";

const db = Database(env.DATABASE_PATH);

db.prepare(`
    CREATE TABLE IF NOT EXISTS user (
        id TEXT NOT NULL PRIMARY KEY,
        email VARCHAR NOT NULL
    )
`).run();

db.prepare(`
    CREATE TABLE IF NOT EXISTS user_key (
        id TEXT NOT NULL PRIMARY KEY,
        user_id TEXT NOT NULL,
        hashed_password TEXT,
        FOREIGN KEY (user_id) REFERENCES user(id)
    )
`).run();

db.prepare(`
    CREATE TABLE IF NOT EXISTS user_session (
        id TEXT NOT NULL PRIMARY KEY,
        user_id TEXT NOT NULL,
        active_expires INTEGER NOT NULL,
        idle_expires INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES user(id)
    )
`).run();

export function getUserIdByEmail(email: string) {
    return db.prepare("SELECT id FROM user AS u WHERE u.email = ?").get(email) as string|undefined;
}

export { db as database } 