export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS monitored_urls (
  id INTEGER PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS health_checks (
  id INTEGER PRIMARY KEY,
  url_id INTEGER NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  checked_at DATETIME NOT NULL,
  is_up BOOLEAN NOT NULL,
  FOREIGN KEY (url_id) REFERENCES monitored_urls(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_health_checks_url_id ON health_checks(url_id);
CREATE INDEX IF NOT EXISTS idx_health_checks_checked_at ON health_checks(checked_at);
`;
