import { getDatabase } from "./db.js";
import type { HealthCheck, NewHealthCheck } from "./types.js";

function rowToHealthCheck(row: Record<string, unknown>): HealthCheck {
  return {
    id: row.id as number,
    url_id: row.url_id as number,
    status_code: row.status_code as number | null,
    response_time_ms: row.response_time_ms as number | null,
    checked_at: row.checked_at as string,
    is_up: Boolean(row.is_up),
  };
}

export function addHealthCheck(check: NewHealthCheck): HealthCheck {
  const stmt = getDatabase().prepare(`
    INSERT INTO health_checks (url_id, status_code, response_time_ms, checked_at, is_up)
    VALUES (@url_id, @status_code, @response_time_ms, @checked_at, @is_up)
    RETURNING id, url_id, status_code, response_time_ms, checked_at, is_up
  `);

  const row = stmt.get({
    ...check,
    is_up: check.is_up ? 1 : 0,
  }) as Record<string, unknown>;

  return rowToHealthCheck(row);
}

export function getHealthCheckById(id: number): HealthCheck | undefined {
  const stmt = getDatabase().prepare(`
    SELECT id, url_id, status_code, response_time_ms, checked_at, is_up
    FROM health_checks
    WHERE id = ?
  `);
  const row = stmt.get(id) as Record<string, unknown> | undefined;
  return row ? rowToHealthCheck(row) : undefined;
}

export function getHealthChecksByUrlId(urlId: number): HealthCheck[] {
  const stmt = getDatabase().prepare(`
    SELECT id, url_id, status_code, response_time_ms, checked_at, is_up
    FROM health_checks
    WHERE url_id = ?
    ORDER BY checked_at DESC
  `);
  const rows = stmt.all(urlId) as Record<string, unknown>[];
  return rows.map(rowToHealthCheck);
}

export function getLatestHealthCheckByUrlId(urlId: number): HealthCheck | undefined {
  const stmt = getDatabase().prepare(`
    SELECT id, url_id, status_code, response_time_ms, checked_at, is_up
    FROM health_checks
    WHERE url_id = ?
    ORDER BY checked_at DESC
    LIMIT 1
  `);
  const row = stmt.get(urlId) as Record<string, unknown> | undefined;
  return row ? rowToHealthCheck(row) : undefined;
}

export function getAllHealthChecks(): HealthCheck[] {
  const stmt = getDatabase().prepare(`
    SELECT id, url_id, status_code, response_time_ms, checked_at, is_up
    FROM health_checks
    ORDER BY checked_at DESC
  `);
  const rows = stmt.all() as Record<string, unknown>[];
  return rows.map(rowToHealthCheck);
}
