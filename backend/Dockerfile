# syntax=docker/dockerfile:1

# Build context is the repository root (see docker-compose.yml).

ARG NODE_VERSION=24
ARG PNPM_VERSION=12.18.0

FROM node:${NODE_VERSION}-alpine AS base
ARG PNPM_VERSION
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN npm install --global pnpm@${PNPM_VERSION}
WORKDIR /app

# Install workspace dependencies with the lockfile.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN pnpm install --frozen-lockfile --filter backend...

# Compile the NestJS app.
FROM deps AS build
COPY backend/nest-cli.json backend/tsconfig.json backend/tsconfig.build.json ./backend/
COPY backend/src ./backend/src
RUN pnpm --filter backend build

# Create a production-only bundle (package.json + production node_modules).
FROM deps AS prod-deps
RUN pnpm --filter backend deploy --prod /prod/backend
# pnpm deploy packs from git/npm ignore rules, so dist is copied explicitly.
COPY --from=build /app/backend/dist /prod/backend/dist

FROM node:${NODE_VERSION}-alpine AS runtime
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

COPY --from=prod-deps --chown=node:node /prod/backend ./

USER node
EXPOSE 3000

CMD ["node", "dist/main.js"]
