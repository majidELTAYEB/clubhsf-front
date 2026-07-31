import { api } from '$lib/services/api';
import type { NewVideoRequest, NewVideoResponse, UploadCredentials, NewCollectionRequest, Collection, CollectionsResponse, CollectionResponse } from './types';

export function createVideo(body : NewVideoRequest) {
  return api.post<NewVideoResponse>('/videos', body);
}

export async function getUploadCredentials(videoId: string) {
    return api.get<UploadCredentials>(`/videos/${videoId}/upload-credentials`);

}

export function getCollections() {
  return api.get<CollectionsResponse>(`/collections`);
}

export function createCollection(body: NewCollectionRequest) {
  return api.post<CollectionResponse>('/collections', body);
}

export function addVideoToCollection(collectionId: string, videoId: string) {
  return api.post<Collection>(`/collections/${collectionId}/items`, { video_id: videoId });
}