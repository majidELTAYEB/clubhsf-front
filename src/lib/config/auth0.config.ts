import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
  return value;
}

export const AUTH0_DOMAIN = required('AUTH0_DOMAIN', privateEnv.AUTH0_DOMAIN);
export const AUTH0_CLIENT_ID = required('AUTH0_CLIENT_ID', privateEnv.AUTH0_CLIENT_ID);
export const AUTH0_CLIENT_SECRET = required('AUTH0_CLIENT_SECRET', privateEnv.AUTH0_CLIENT_SECRET);
export const AUTH0_AUDIENCE = required('AUTH0_AUDIENCE', privateEnv.AUTH0_AUDIENCE);
export const AUTH0_CALLBACK_URL = required('AUTH0_CALLBACK_URL', privateEnv.AUTH0_CALLBACK_URL);
export const PUBLIC_APP_URL = required('PUBLIC_APP_URL', publicEnv.PUBLIC_APP_URL);

export const AUTH0_AUTHORIZE_URL = `https://${AUTH0_DOMAIN}/authorize`;
export const AUTH0_TOKEN_URL = `https://${AUTH0_DOMAIN}/oauth/token`;
export const AUTH0_LOGOUT_URL = `https://${AUTH0_DOMAIN}/v2/logout`;