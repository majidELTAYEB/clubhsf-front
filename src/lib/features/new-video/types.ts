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


export interface CollectionItem {
  video_id: string;
  position: number;
}

export interface Collection {
  id: string;
  title: string;
  slug: string;
  description?: string;
  cover_image_url?: string;
  is_public: boolean;
  items?: CollectionItem[];
  created_at: string;
}

export interface NewCollectionRequest {
  title: string;
  description?: string;
}

export interface CollectionsResponse {
    success : boolean,
    data : [
        Collection
    ]
}

export interface CollectionResponse {
    success : boolean,
    data : Collection
    
}