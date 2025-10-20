FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

# Only package files needed for install to leverage Docker layer caching
COPY package.json pnpm-lock.yaml ./

FROM base AS deps
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm build

FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production

# Enable pnpm in runtime image only if needed for postinstall scripts; otherwise copy node_modules
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

# Copy only what is needed to run
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./package.json
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]


