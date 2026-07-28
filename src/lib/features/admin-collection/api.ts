import type { CollectionResponse } from "./types";
import { api } from "$lib/services/api";

export function getCollection(id : string) {
  return api.get<CollectionResponse>(`/collections/${id}`);
}

export const getCollectionVideos = async (collectionId: string) => {
  return api.get(`/collections/${collectionId}/videos`);
};

export const updateCollection = async (collectionId: string, data: { title?: string; description?: string; is_public?: boolean }) => {
  return api.patch(`/collections/${collectionId}`, data);
};

export const deleteCollection = async (collectionId: string) => {
  return api.del(`/collections/${collectionId}`);
};

export const removeVideoFromCollection = async (collectionId: string, videoId: string) => {
  return api.del(`/collections/${collectionId}/videos/${videoId}`);
};
export const deleteVideo = async (videoId: string) => {
  return api.del(`/videos/${videoId}`);
};