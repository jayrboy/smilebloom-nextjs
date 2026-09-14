# Smilebloom Mongo seed

ไฟล์นี้ใช้ import ข้อมูลเริ่มต้นให้แอปกลับมาใช้งานได้เมื่อฐานข้อมูลว่าง

บัญชีเริ่มต้น:

- username: `admin`
- password: `admin1234`
- role: `ADMIN`

## Import ด้วย mongoimport

แทนค่า `<MONGODB_URI>` ด้วย connection string ของโปรเจกต์

```powershell
mongoimport --uri "<MONGODB_URI>" --collection users --file .\mongo-seed\users.json --jsonArray --mode upsert --upsertFields username
mongoimport --uri "<MONGODB_URI>" --collection smile_config --file .\mongo-seed\smile_config.json --jsonArray --mode upsert --upsertFields key
```

ถ้าใช้ database name แยกใน URI แล้ว ไม่ต้องใส่ `--db` เพิ่ม

ถ้า URI ไม่มี database name ให้เพิ่ม `--db <DB_NAME>` เช่น:

```powershell
mongoimport --uri "<MONGODB_URI>" --db smilebloom --collection users --file .\mongo-seed\users.json --jsonArray --mode upsert --upsertFields username
mongoimport --uri "<MONGODB_URI>" --db smilebloom --collection smile_config --file .\mongo-seed\smile_config.json --jsonArray --mode upsert --upsertFields key
```
