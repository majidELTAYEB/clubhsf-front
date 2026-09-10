import type { MembersResponse } from "./types";
import { api } from "$lib/services/api";

export function getMembers(params: URLSearchParams) {
  return api.get<MembersResponse>(`/users/members?${params.toString()}`);
}