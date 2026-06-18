export interface LatestCheck {
  is_up: boolean;
  status_code: number | null;
  response_time_ms: number | null;
  checked_at: string;
}

export interface MonitoredUrlRow {
  id: number;
  url: string;
  latest_check: LatestCheck | null;
}

export interface CreatedUrl {
  id: number;
  url: string;
}

export interface HistoryCheck {
  id: number;
  is_up: boolean;
  status_code: number | null;
  response_time_ms: number | null;
  checked_at: string;
}
