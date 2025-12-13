# syntax=docker/dockerfile:1

FROM node:24-bullseye AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY types/package.json types/package.json

RUN npm ci --workspaces --include-workspace-root --ignore-scripts

FROM deps AS builder
WORKDIR /app
COPY . .

ENV NODE_ENV=production

RUN npm run build:types
RUN npm run build:backend

FROM node:24-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/types ./types
COPY package.json package-lock.json ./

EXPOSE 3000

CMD ["sh", "-c", "npm run init-db --prefix backend && npm run start --prefix backend"]
