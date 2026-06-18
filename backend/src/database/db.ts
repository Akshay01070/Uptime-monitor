import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { SCHEMA_SQL } from "./schema.js";

const DEFAULT_DB_PATH = path.resolve("data", "uptime.db");

let db: Database.Database | null = null;

function resolveDbPath(): string {
  return process.env.DATABASE_PATH ?? DEFAULT_DB_PATH;
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase() first.");
  }
  return db;
}

export function initializeDatabase(dbPath = resolveDbPath()): Database.Database {
  if (db) {
    return db;
  }

  const directory = path.dirname(dbPath);
  fs.mkdirSync(directory, { recursive: true });

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA_SQL);

  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
