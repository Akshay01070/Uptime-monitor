import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { addUrl, fetchUrlHistory, fetchUrls } from "./api";
import type { HistoryCheck, MonitoredUrlRow } from "./types";

const REFRESH_INTERVAL_MS = 15_000;

function formatResponseTime(ms: number | null | undefined): string {
  if (ms == null) {
    return "—";
  }
  return `${ms} ms`;
}

function formatLastChecked(checkedAt: string | undefined): string {
  if (!checkedAt) {
    return "—";
  }
  return new Date(checkedAt).toLocaleString();
}

function formatStatusCode(code: number | null): string {
  return code == null ? "—" : String(code);
}

function StatusBadge({ isUp }: { isUp: boolean | null }) {
  if (isUp === null) {
    return <span className="badge badge-pending">Pending</span>;
  }
  return (
    <span className={`badge ${isUp ? "badge-up" : "badge-down"}`}>
      {isUp ? "UP" : "DOWN"}
    </span>
  );
}

function HistoryModal({
  url,
  history,
  loading,
  error,
  onClose,
}: {
  url: string;
  history: HistoryCheck[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Health Check History</h2>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <p className="modal-url">{url}</p>
        {loading ? (
          <p className="loading">Loading…</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : history.length === 0 ? (
          <p className="empty">No health checks recorded yet.</p>
        ) : (
          <table className="url-table history-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Status Code</th>
                <th>Response Time</th>
                <th>Up/Down</th>
              </tr>
            </thead>
            <tbody>
              {history.map((check) => (
                <tr key={check.id}>
                  <td>{formatLastChecked(check.checked_at)}</td>
                  <td>{formatStatusCode(check.status_code)}</td>
                  <td>{formatResponseTime(check.response_time_ms)}</td>
                  <td>
                    <StatusBadge isUp={check.is_up} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function App() {
  const [urls, setUrls] = useState<MonitoredUrlRow[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<MonitoredUrlRow | null>(
    null,
  );
  const [history, setHistory] = useState<HistoryCheck[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const loadUrls = useCallback(async () => {
    try {
      const data = await fetchUrls();
      setUrls(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load URLs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUrls();
  }, [loadUrls]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      void loadUrls();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [loadUrls]);

  async function handleRowClick(row: MonitoredUrlRow) {
    setSelectedUrl(row);
    setHistory([]);
    setHistoryError(null);
    setHistoryLoading(true);

    try {
      const data = await fetchUrlHistory(row.id);
      setHistory(data);
    } catch (err) {
      setHistoryError(
        err instanceof Error ? err.message : "Failed to load history",
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  function closeHistoryModal() {
    setSelectedUrl(null);
    setHistory([]);
    setHistoryError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = newUrl.trim();
    if (!trimmed) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await addUrl(trimmed);
      setNewUrl("");
      await loadUrls();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add URL");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Uptime Monitor</h1>
      </header>

      <main className="main">
        <form className="add-form" onSubmit={handleSubmit}>
          <input
            type="url"
            className="url-input"
            placeholder="https://example.com"
            value={newUrl}
            onChange={(event) => setNewUrl(event.target.value)}
            disabled={submitting}
            required
          />
          <button type="submit" className="add-button" disabled={submitting}>
            {submitting ? "Adding…" : "Add"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        <section className="table-section">
          {loading ? (
            <p className="loading">Loading…</p>
          ) : urls.length === 0 ? (
            <p className="empty">No URLs monitored yet. Add one above.</p>
          ) : (
            <table className="url-table">
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Status</th>
                  <th>Response Time</th>
                  <th>Last Checked</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((row) => (
                  <tr
                    key={row.id}
                    className="url-row"
                    onClick={() => void handleRowClick(row)}
                  >
                    <td className="url-cell">{row.url}</td>
                    <td>
                      <StatusBadge
                        isUp={
                          row.latest_check ? row.latest_check.is_up : null
                        }
                      />
                    </td>
                    <td>
                      {formatResponseTime(row.latest_check?.response_time_ms)}
                    </td>
                    <td>{formatLastChecked(row.latest_check?.checked_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>

      {selectedUrl && (
        <HistoryModal
          url={selectedUrl.url}
          history={history}
          loading={historyLoading}
          error={historyError}
          onClose={closeHistoryModal}
        />
      )}
    </div>
  );
}

export default App;
