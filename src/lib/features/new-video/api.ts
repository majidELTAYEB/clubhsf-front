import { api } from '$lib/services/api';
import type { NewVideoRequest, NewVideoResponse, UploadCredentials } from './types';

export function createVideo(body : NewVideoRequest) {
  return api.post<NewVideoResponse>('/videos', body);
}

export async function getUploadCredentials(videoId: string) {
    return api.get<UploadCredentials>(`/videos/${videoId}/upload-credentials`);

}