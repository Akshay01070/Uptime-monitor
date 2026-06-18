import { AppError } from "../errors/AppError.js";
import {
  addMonitoredUrl,
  getAllMonitoredUrls,
  getHealthChecksByUrlId,
  getLatestHealthCheckByUrlId,
  getMonitoredUrlById,
  getMonitoredUrlByUrl,
} from "../database/index.js";

export interface LatestCheck {
  is_up: boolean;
  status_code: number | null;
  response_time_ms: number | null;
  checked_at: string;
}

export interface UrlWithLatestCheck {
  id: number;
  url: string;
  latest_check: LatestCheck | null;
}

export interface HistoryCheck {
  id: number;
  is_up: boolean;
  status_code: number | null;
  response_time_ms: number | null;
  checked_at: string;
}

export interface CreatedUrl {
  id: number;
  url: string;
}

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export function validateUrl(url: string): string {
  if (typeof url !== "string" || url.trim() === "") {
    throw new AppError(400, "URL is required");
  }

  const trimmed = url.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new AppError(400, "Invalid URL format");
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new AppError(400, "Only http and https URLs are allowed");
  }

  return trimmed;
}

export function createUrl(rawUrl: unknown): CreatedUrl {
  const url = validateUrl(String(rawUrl ?? ""));

  const existing = getMonitoredUrlByUrl(url);
  if (existing) {
    throw new AppError(409, "URL is already being monitored");
  }

  const created = addMonitoredUrl(url);
  return { id: created.id, url: created.url };
}

export function listUrls(): UrlWithLatestCheck[] {
  return getAllMonitoredUrls().map((monitoredUrl) => {
    const latest = getLatestHealthCheckByUrlId(monitoredUrl.id);

    return {
      id: monitoredUrl.id,
      url: monitoredUrl.url,
      latest_check: latest
        ? {
            is_up: latest.is_up,
            status_code: latest.status_code,
            response_time_ms: latest.response_time_ms,
            checked_at: latest.checked_at,
          }
        : null,
    };
  });
}

export function getUrlHistory(urlId: number): HistoryCheck[] {
  const monitoredUrl = getMonitoredUrlById(urlId);
  if (!monitoredUrl) {
    throw new AppError(404, "URL not found");
  }

  return getHealthChecksByUrlId(urlId).map((check) => ({
    id: check.id,
    is_up: check.is_up,
    status_code: check.status_code,
    response_time_ms: check.response_time_ms,
    checked_at: check.checked_at,
  }));
}
