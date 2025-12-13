# syntax=docker/dockerfile:1

FROM node:20-bullseye AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY types/package.json types/package.json

RUN npm ci --workspaces --include-workspace-root --ignore-scripts

FROM deps AS builder
WORKDIR /app
COPY . .

ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=${VITE_API_URL}
ENV NODE_ENV=production

RUN npm run build:types
RUN npm run build:backend
RUN npm run build:frontend

FROM node:20-bullseye AS backend
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/types ./types
COPY package.json package-lock.json ./

EXPOSE 3000
CMD ["sh", "-c", "npm run init-db --prefix backend && npm run start --prefix backend"]

FROM nginx:1.27-alpine AS frontend
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
