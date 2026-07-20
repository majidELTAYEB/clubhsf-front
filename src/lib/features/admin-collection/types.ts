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


export interface CollectionResponse {
    success : boolean,
    data : Collection
    
}