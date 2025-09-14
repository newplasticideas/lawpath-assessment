FROM node:20-alpine

WORKDIR /install

RUN npm install -g pnpm

RUN apk add --no-cache curl

COPY package.json pnpm-lock.yaml .env.local ./
RUN pnpm install --frozen-lockfile

COPY scripts/es-setup.ts ./scripts/es-setup.ts
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]
