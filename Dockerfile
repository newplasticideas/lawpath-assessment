FROM node:20-alpine

WORKDIR /install

# Install pnpm globally
RUN npm install -g pnpm

# Install curl (needed for entrypoint health check)
RUN apk add --no-cache curl

# Copy only what's needed for the setup script
COPY package.json pnpm-lock.yaml .env.local ./
RUN pnpm install --frozen-lockfile

COPY scripts/es-setup.ts ./scripts/es-setup.ts
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

# Entrypoint just runs the setup and exits
ENTRYPOINT ["./docker-entrypoint.sh"]
