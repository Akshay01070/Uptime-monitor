import { getDatabase } from "./db.js";
import type { MonitoredUrl } from "./types.js";

export function addMonitoredUrl(url: string): MonitoredUrl {
  const stmt = getDatabase().prepare(
    "INSERT INTO monitored_urls (url) VALUES (?) RETURNING id, url, created_at"
  );
  return stmt.get(url) as MonitoredUrl;
}

export function getMonitoredUrlById(id: number): MonitoredUrl | undefined {
  const stmt = getDatabase().prepare(
    "SELECT id, url, created_at FROM monitored_urls WHERE id = ?"
  );
  return stmt.get(id) as MonitoredUrl | undefined;
}

export function getMonitoredUrlByUrl(url: string): MonitoredUrl | undefined {
  const stmt = getDatabase().prepare(
    "SELECT id, url, created_at FROM monitored_urls WHERE url = ?"
  );
  return stmt.get(url) as MonitoredUrl | undefined;
}

export function getAllMonitoredUrls(): MonitoredUrl[] {
  const stmt = getDatabase().prepare(
    "SELECT id, url, created_at FROM monitored_urls ORDER BY created_at DESC"
  );
  return stmt.all() as MonitoredUrl[];
}

export function deleteMonitoredUrl(id: number): boolean {
  const stmt = getDatabase().prepare("DELETE FROM monitored_urls WHERE id = ?");
  const result = stmt.run(id);
  return result.changes > 0;
}
