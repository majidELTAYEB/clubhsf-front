export interface LiveRequest {
  title: string
  description?: string;
  schedule_at?: string;
}

export interface LiveResponse {
  id: string
  description: string;
  schedule_at?: string;
  Status: string;
  stream_key: string;
  rtmp_url: string;
  playback_id: string;
}
