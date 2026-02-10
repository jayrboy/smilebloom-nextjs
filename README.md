# Smilebloom (Next.js)

## ภาพรวม (Overview)

**TH**: Smilebloom คือเว็บแอปสำหรับติดตาม “ลำดับการขึ้นของฟัน” และบันทึกเหตุการณ์ (event log) ต่อเด็กแต่ละคน พร้อมหน้า Dashboard สรุปภาพรวม และหน้า Profile สำหรับแก้ไขข้อมูลเบื้องต้น

**EN**: Smilebloom is a web app to track tooth eruption timelines and log events per child, with a summary dashboard and an editable profile page.

### เทคโนโลยีที่ใช้ (Tech stack)

- Next.js (App Router) + TypeScript + TailwindCSS
- NextAuth (Credentials)
- MongoDB + Mongoose

## ฟีเจอร์ (Features)

**TH**
- สมัครสมาชิก / เข้าสู่ระบบ
- Dashboard: ดูจำนวนเด็ก + เหตุการณ์ล่าสุด
- Teeth: ดูลำดับการขึ้นฟัน (ฟันน้ำนม/ฟันแท้) + บันทึกเหตุการณ์
- Profile: แก้ไขอีเมล (บันทึกลง MongoDB)

**EN**
- Register / Login
- Dashboard: children count + recent events
- Teeth: deciduous/permanent timeline + event log
- Profile: edit email (persisted to MongoDB)

## ข้อกำหนด (Requirements)

**TH**
- Node.js 20+ (แนะนำ)
- Docker (ถ้าจะรันผ่าน docker compose)

**EN**
- Node.js 20+ recommended
- Docker (optional, for docker compose)

## ตั้งค่า Environment Variables (Environment variables)

> **TH Security note**: ห้าม commit `.env` และห้ามเผย secrets เด็ดขาด  
> **EN Security note**: Never commit `.env` and never paste secrets into docs/PRs.

สร้างไฟล์ `.env` จาก `.env.example`

Create `.env` based on `.env.example`:

```bash
cp .env.example .env
```

### ตัวแปรที่จำเป็น (Required variables)

- `MONGODB_URI`: MongoDB connection string
- `NEXTAUTH_SECRET`: secret สำหรับ NextAuth (ควรสุ่มและยาวพอ / should be long & random)
- `NEXTAUTH_URL`: base URL ของเว็บ (สำคัญมาก / important)
- `NGINX_PORT`: (optional) พอร์ต Nginx เมื่อใช้ docker compose

ตัวอย่าง `.env` (ห้ามใส่ค่าจริงลง git)

Example `.env` (do not commit):

```env
MONGODB_URI=mongodb://localhost:27017/smilebloom
NEXTAUTH_SECRET=replace-me
NEXTAUTH_URL=http://localhost:3000
NGINX_PORT=80
```

แนะนำวิธีสร้าง `NEXTAUTH_SECRET` (Recommended):

```bash
openssl rand -base64 32
```

## Run แบบ Dev (Local development)

```bash
npm install
npm run dev
```

เปิด/Access `http://localhost:3000`

## Run แบบ Production (Local)

```bash
npm run build
npm start
```

## Docker

### Dockerfile (build & run)

```bash
docker build -t smilebloom .
docker run --rm -p 3000:3000 --env-file .env smilebloom
```

**TH**: ถ้าต้องการให้คนอื่นเข้ามาทดลองผ่านพอร์ต 80 (เช่น `http://<server-ip>/`) ให้ map พอร์ต host `80` ไปที่พอร์ตใน container (`3000`)

**EN**: To let others access via port 80 (e.g. `http://<server-ip>/`), map host port `80` to container port `3000`.

```bash
docker run --rm -p 80:3000 --env-file .env smilebloom
```

### Docker Compose (Next.js + Nginx)

**TH**: โปรเจกต์นี้รันแบบ 2 services:
- `app`: Next.js (build + start) ฟังที่ `3000`
- `nginx`: reverse proxy รับที่ `80` แล้วส่งต่อไป `app:3000`

**EN**: This project runs 2 services:
- `app`: Next.js (build + start) on `3000`
- `nginx`: reverse proxy on `80` → `app:3000`

Run:

```bash
docker compose up --build
```

เปิด/Access:

- `http://localhost:${NGINX_PORT:-80}`

Logs:

```bash
docker compose logs -f nginx app
```

Stop:

```bash
docker compose down
```

**หมายเหตุ (NextAuth) / Note (NextAuth)**  
ถ้าเข้าผ่าน Nginx ให้ตั้ง `NEXTAUTH_URL` ให้ตรงกับ URL ที่เข้าจริง เช่น:

- ถ้า Nginx อยู่ที่พอร์ต 80: `NEXTAUTH_URL=http://localhost`
- ถ้าเปลี่ยนพอร์ต: `NEXTAUTH_URL=http://localhost:<NGINX_PORT>`

## วิธีใช้งาน (User guide)

### สมัครสมาชิก (Register)

- ไปที่ `GET /register`
- กรอก `username` + `password` แล้วสมัครสมาชิก

### เข้าสู่ระบบ (Login)

- ไปที่ `GET /auth/login`
- ล็อกอินด้วย `username` + `password`

### Dashboard

- ไปที่ `GET /dashboard`
- ดูสรุปจำนวนเด็ก + เหตุการณ์ล่าสุด และทางลัดไปหน้า Teeth/Profile

### Teeth (ลำดับการขึ้นฟัน + บันทึกเหตุการณ์)

- ไปที่ `GET /teeth`
- เลือกแท็บ **ฟันน้ำนม / ฟันแท้**
- เพิ่มเด็ก (ชื่อ + วันเกิด)
- ดู timeline การขึ้นฟันตามช่วงอายุ (เดือนหลังคลอด)
- บันทึก event:
  - `ERUPTED` ฟันขึ้น
  - `SHED` ฟันน้ำนมหลุด
  - `EXTRACTED` ถอนฟัน
  - `NOTE` โน้ต/อาการ

### Profile

- ไปที่ `GET /profile`
- แก้ไขอีเมล แล้วกด **บันทึก** (อัปเดตลง MongoDB)

## API Reference (ย่อ)

- `POST /api/register`
- `GET /api/profile`
- `PATCH /api/profile`
- `GET /api/children`
- `POST /api/children`
- `PATCH /api/children/:id`
- `DELETE /api/children/:id`
- `GET /api/teeth`
- `GET /api/teeth-events`
- `POST /api/teeth-events`

## Troubleshooting

### 1) Login แล้วเด้ง/401 (NEXTAUTH_URL ไม่ตรง)

**TH**: ตรวจ `NEXTAUTH_URL` ให้ตรงกับ URL ที่เข้าเว็บจริง (โดยเฉพาะกรณีผ่าน Nginx)  
**EN**: Ensure `NEXTAUTH_URL` matches your actual access URL (especially behind Nginx)

### 2) ต่อ MongoDB ไม่ได้

**TH**: ตรวจ `MONGODB_URI` และการเข้าถึง network/credentials  
**EN**: Check `MONGODB_URI` and your network/credentials

### 3) `next build` ล้มเหลวเพราะฟอนต์ (offline/CI)

**TH**: โปรเจกต์ใช้ `next/font` (Google Fonts) อาจ build ไม่ผ่านถ้า environment ออกเน็ตไม่ได้  
**EN**: This project uses `next/font` (Google Fonts). Builds may fail in environments without internet access.

แนวทาง (Options):
- รัน build ใน environment ที่ออกเน็ตได้
- หรือเปลี่ยนไปใช้ local font ในอนาคต
