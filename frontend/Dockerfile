# syntax=docker/dockerfile:1

# Build context is the repository root (see docker-compose.yml).

ARG NODE_VERSION=24
ARG PNPM_VERSION=12.18.0

FROM node:${NODE_VERSION}-alpine AS build
ARG PNPM_VERSION
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN npm install --global pnpm@${PNPM_VERSION}
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN pnpm install --frozen-lockfile --filter frontend...

COPY frontend/ ./frontend/
RUN pnpm --filter frontend build

FROM nginx:1.29-alpine AS runtime
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
