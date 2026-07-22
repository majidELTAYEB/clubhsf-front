export interface TokenSet {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}



export interface AuthUser {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  role?: string;
  isPremium?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_premium: boolean;
  created_at: string;
}