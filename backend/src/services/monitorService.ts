import { addHealthCheck, getAllMonitoredUrls } from "../database/index.js";

export const CHECK_TIMEOUT_MS = 5_000;

export interface CheckResult {
  url_id: number;
  status_code: number | null;
  response_time_ms: number;
  checked_at: string;
  is_up: boolean;
}

function isUpStatusCode(statusCode: number): boolean {
  return statusCode >= 200 && statusCode < 400;
}

export async function checkUrl(urlId: number, url: string): Promise<CheckResult> {
  const start = Date.now();

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
    });
    const response_time_ms = Date.now() - start;

    return {
      url_id: urlId,
      status_code: response.status,
      response_time_ms,
      checked_at: new Date().toISOString(),
      is_up: isUpStatusCode(response.status),
    };
  } catch {
    return {
      url_id: urlId,
      status_code: null,
      response_time_ms: Date.now() - start,
      checked_at: new Date().toISOString(),
      is_up: false,
    };
  }
}

export async function runMonitoringCycle(): Promise<void> {
  const urls = getAllMonitoredUrls();

  await Promise.all(
    urls.map(async (monitoredUrl) => {
      try {
        const result = await checkUrl(monitoredUrl.id, monitoredUrl.url);
        addHealthCheck(result);
      } catch (error) {
        console.error(
          `Failed to store health check for URL id=${monitoredUrl.id}:`,
          error
        );
      }
    })
  );
}
