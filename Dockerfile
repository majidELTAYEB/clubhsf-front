FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .

# Valeurs factices pour satisfaire la validation au build — écrasées au runtime par le vrai .env
ENV AUTH0_DOMAIN=build-placeholder.auth0.com
ENV AUTH0_CLIENT_ID=build-placeholder
ENV AUTH0_CLIENT_SECRET=build-placeholder
ENV AUTH0_AUDIENCE=build-placeholder
ENV AUTH0_M2M_CLIENT_ID=build-placeholder
ENV AUTH0_M2M_CLIENT_SECRET=build-placeholder
ENV PUBLIC_APP_URL=http://localhost:3000
ENV STRIPE_SECRET_KEY=sk_placeholder
ENV STRIPE_PRICE_MONTHLY=price_placeholder
ENV STRIPE_PRICE_YEARLY=price_placeholder

RUN pnpm run build

FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
EXPOSE 3000
ENV PORT=3000
CMD ["node", "build"]