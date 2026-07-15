export interface LiveResponse {
  id: string;
  title: string;
  description: string;
  schedule_at?: string;
  status: string;
  stream_key: string;
  rtmp_url: string;
  playback_id: string;
}