import type { CreatedUrl, HistoryCheck, MonitoredUrlRow } from "./types";

function getApiBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL;
  if (!url) {
    throw new Error("VITE_API_URL environment variable is not set");
  }
  return url.replace(/\/$/, "");
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string; message?: string };
    return body.error ?? body.message ?? response.statusText;
  } catch {
    return response.statusText || "Request failed";
  }
}

export async function fetchUrls(): Promise<MonitoredUrlRow[]> {
  const response = await fetch(`${getApiBaseUrl()}/urls`);
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json() as Promise<MonitoredUrlRow[]>;
}

export async function fetchUrlHistory(id: number): Promise<HistoryCheck[]> {
  const response = await fetch(`${getApiBaseUrl()}/urls/${id}/history`);
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json() as Promise<HistoryCheck[]>;
}

export async function addUrl(url: string): Promise<CreatedUrl> {
  const response = await fetch(`${getApiBaseUrl()}/urls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json() as Promise<CreatedUrl>;
}
