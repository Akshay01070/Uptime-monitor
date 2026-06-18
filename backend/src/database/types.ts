export interface MonitoredUrl {
  id: number;
  url: string;
  created_at: string;
}

export interface HealthCheck {
  id: number;
  url_id: number;
  status_code: number | null;
  response_time_ms: number | null;
  checked_at: string;
  is_up: boolean;
}

export interface NewHealthCheck {
  url_id: number;
  status_code: number | null;
  response_time_ms: number | null;
  checked_at: string;
  is_up: boolean;
}
