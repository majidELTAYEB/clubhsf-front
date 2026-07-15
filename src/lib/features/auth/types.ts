export interface AuthUser {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

export interface TokenSet {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export interface ViewerCountResponse {
  viewers: number;
}

export interface ChatHistoryResponse {
  messages : [
    {
      viewerId : string;
      content: string
    }
  ]
}