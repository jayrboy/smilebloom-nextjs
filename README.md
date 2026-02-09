This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Dockerfile

```bash
$ docker build -t smilebloom .
$ docker run --rm -p 3000:3000 smilebloom
```

# Docker Hub

```bash
# Build and Run
$ docker build -t jayrjakkrit/nextjs-smilebloom-app:0.1 .
$ docker run -d -p 3000:3000 --name nextjs-smilebloom-app jayrjakkrit/nextjs-smilebloom-app:0.1
# Upload Docker Hub
$ docker push jayrjakkrit/nextjs-smilebloom-app:0.1
# Download Docker Hub
```

# Docker Compose (Next.js + Nginx)

โปรเจกต์นี้รันแบบ 2 services:
- `app`: Next.js (`pnpm build` + `pnpm start`) ฟังที่ `3000`
- `nginx`: reverse proxy รับที่ `80` แล้วส่งต่อไป `app:3000`

## Run

```bash
docker compose up --build
```

เปิดในเบราว์เซอร์:
- `http://localhost:${NGINX_PORT:-80}`

## Logs

```bash
docker compose logs -f nginx app
```

## Test ด้วย curl

```bash
curl -I "http://localhost:${NGINX_PORT:-80}"
```

## Stop / Cleanup

```bash
docker compose down
```

## หมายเหตุ (NextAuth)

ถ้าใช้ NextAuth แนะนำให้ตั้ง `NEXTAUTH_URL` ให้ตรงกับ URL ที่เข้าผ่าน Nginx เช่น:
- ถ้า Nginx อยู่ที่พอร์ต 80: `NEXTAUTH_URL=http://localhost`
- ถ้าเปลี่ยนพอร์ต: `NEXTAUTH_URL=http://localhost:<NGINX_PORT>`
