import type { CollectionResponse } from "./types";
import { api } from "$lib/services/api";

export function getCollection(id : string) {
  return api.get<CollectionResponse>(`/collections/${id}`);
}

export const getCollectionItems = async (collectionId: string) => {
  return api.get(`/collections/${collectionId}/items`);
};

export const updateCollection = async (collectionId: string, data: { title?: string; description?: string; is_public?: boolean }) => {
  return api.patch(`/collections/${collectionId}`, data);
};

export const deleteCollection = async (collectionId: string) => {
  return api.del(`/collections/${collectionId}`);
};

export const removeVideoFromCollection = async (collectionId: string, videoId: string) => {
  return api.del(`/collections/${collectionId}/video/${videoId}`);
};
export const deleteVideo = async (videoId: string) => {
  return api.del(`/videos/${videoId}`);
};


export function getArticle(id: string) {
  return api.get(`/articles/${id}`);
}

export function getArticleBySlug(slug: string) {
  return api.get(`/articles/slug/${slug}`);
}

export function listArticles() {
  return api.get(`/articles`);
}

export function updateArticle(
  id: string,
  data: { title: string; excerpt?: string; content: object; is_public: boolean }
) {
  return api.patch(`/articles/${id}`, data);
}

export function deleteArticle(id: string) {
  return api.del(`/articles/${id}`);
}

export async function presignArticleImage(filename: string, contentType: string) {
  const res = await api.post<{ data: { upload_url: string; public_url: string } }>(
    `/articles/images/presign`,
    { filename, content_type: contentType }
  );
  return res.data;
}

export function presignArticleImagesBatch(
  items: { filename: string; content_type: string }[]
) {
  return api.post<{
    items: { filename: string; upload_url: string; public_url: string; error?: string }[];
  }>(`/articles/images/presign-batch`, { items });
}

export async function uploadArticleImage(file: File): Promise<string> {
	const { upload_url, public_url } = await presignArticleImage(file.name, file.type);

	const putRes = await fetch(upload_url, {
		method: 'PUT',
		headers: { 'Content-Type': file.type },
		body: file
	});
	if (!putRes.ok) throw new Error("Échec de l'upload vers le stockage");

	return public_url;
}

export const addArticleToCollection = async (collectionId: string, articleId: string) => {
  return api.post(`/collections/${collectionId}/articles`, { article_id: articleId });
};

export const removeItemFromCollection = async (
  collectionId: string,
  itemType: "video" | "article",
  itemId: string
) => {
  return api.del(`/collections/${collectionId}/items/${itemType}/${itemId}`);
};

export function createArticle(data: {
  title: string;
  excerpt?: string;
  content: object;
  cover_image_url?: string;
}) {
  return api.post(`/articles`, data);
}