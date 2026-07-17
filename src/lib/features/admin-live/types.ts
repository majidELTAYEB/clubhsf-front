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

export interface ViewerCountResponse {
  viewers: number;
}

export interface ChatHistoryResponse {
  messages : [
    {
      viewerId : string;
      content: string
    }
  ]
}