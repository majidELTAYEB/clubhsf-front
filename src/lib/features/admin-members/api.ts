import type { CollectionResponse } from "./types";
import { api } from "$lib/services/api";

export function getCollection() {
  return api.get<CollectionResponse>(`/users/members`);
}