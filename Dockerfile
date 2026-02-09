FROM node:20-alpine

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat

# Enable pnpm via corepack (bundled with Node)
RUN corepack enable

WORKDIR /app

# Install deps first (better layer caching)
COPY package.json pnpm-lock.yaml* ./
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; else pnpm install; fi

COPY . .

# Build Next.js for `next start`
RUN pnpm build

EXPOSE 3000

ENV HOSTNAME=0.0.0.0
ENV PORT=3000

CMD ["pnpm", "start"]