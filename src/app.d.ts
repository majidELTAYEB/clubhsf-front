import type { AuthUser } from '$lib/features/auth/types';

declare global {
  namespace App {
    interface Locals {
      user: AuthUser | null;
      accessToken: string | null;
    }
  }
}
export {};