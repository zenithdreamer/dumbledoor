FROM node:20 AS alpine

# Setup environment variables
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV TURBO_TELEMETRY_DISABLED=1
ENV CI=true
ENV SKIP_ENV_VALIDATION=true

# Setup pnpm on the alpine base
FROM alpine as base

# Enable corepack and install turbo
RUN corepack enable
RUN pnpm install turbo --global

# Builder
FROM base AS builder

# Install system dependencies
RUN apt update
RUN apt install -y build-essential

# Set working directory
WORKDIR /app
COPY . .

RUN pnpm install
RUN pnpm install -g tsx

# Generate the database and build types
RUN pnpm postinstall
RUN turbo run build --filter=@dumbledoor/log-db
RUN turbo run build --filter=@dumbledoor/user-db
RUN turbo run build --filter=@dumbledoor/access-db
RUN turbo run build --filter=@dumbledoor/door-db
RUN turbo run build --filter=@dumbledoor/card-db
RUN turbo run build --filter=@dumbledoor/alarm-db

# Set runtime working current directory
WORKDIR /app/apps/card

CMD pnpm npx tsx src/index.ts