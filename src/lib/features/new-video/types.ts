export interface NewVideoRequest {
  title: string
  description?: string;
}

export interface NewVideoResponse {
  ID: string;
  Title: string;
  Description: string | null;
  Status: 'pending' | 'uploading' | 'processing' | 'ready' | 'failed';
  BunnyLibraryID: string;
  BunnyVideoID: string;
  DurationSeconds: number | null;
  SizeBytes: number | null;
  EncodeProgress: number;
  ThumbnailURL: string | null;
  ErrorMessage: string | null;
  ReadyAt: string | null; // Format ISO Date
  CreatedAt: string;      // Format ISO Date
  UpdatedAt: string;      // Format ISO Date
}

export interface UploadCredentials {
    Endpoint: string;
    LibraryID: string;
    VideoID: string;
    AuthSignature: string;
    AuthExpire: number;
}