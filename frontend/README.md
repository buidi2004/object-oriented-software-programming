# Frontend

Frontend Next.js cơ bản để test push/pull GitHub.

## Chạy local

```powershell
cd frontend
copy .env.local.example .env.local
npm install
npm run dev
```

Mở:

```text
http://localhost:3000
```

Backend mặc định:

```text
http://localhost:5053
```

Luồng kết nối:

```text
Next.js -> CloudServiceStore.WebApi -> SQL Server
```
