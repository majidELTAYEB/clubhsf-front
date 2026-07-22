import { env as privateEnv } from '$env/dynamic/private';

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
  return value;
}

export const STRIPE_SECRET_KEY = required('STRIPE_SECRET_KEY', privateEnv.STRIPE_SECRET_KEY);

// Un Price ID par fréquence de facturation, créés dans le dashboard Stripe
// (Products → ton produit "Premium" → deux Prices : un récurrent mensuel, un récurrent annuel).
export const STRIPE_PRICE_MONTHLY = required('STRIPE_PRICE_MONTHLY', privateEnv.STRIPE_PRICE_MONTHLY);
export const STRIPE_PRICE_YEARLY = required('STRIPE_PRICE_YEARLY', privateEnv.STRIPE_PRICE_YEARLY);