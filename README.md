# TS Homework Ex4

Backend REST API + WebSocket chat, viết bằng **Express 5 + TypeScript (ESM)**, dùng **MongoDB** làm database.

## Tính năng

- Đăng ký / đăng nhập với JWT access token + refresh token (cookie `httpOnly`)
- Phân quyền theo role: `customer`, `admin`
- CRUD sản phẩm có tìm kiếm, lọc, phân trang
- Chat realtime qua WebSocket

## Cấu trúc thư mục

```
src/
├── index.ts           # Entry point
├── app.ts             # Express app
├── config/env.ts      # Biến môi trường
├── database/          # Kết nối & khởi tạo index MongoDB
├── middleware/        # Auth, error handler
├── modules/
│   ├── auth/          # Đăng nhập, refresh, logout
│   ├── user/          # CRUD user
│   ├── product/       # CRUD sản phẩm
│   └── chat/          # Lịch sử tin nhắn
├── realtime/ws.ts     # WebSocket server
├── types/             # Type mở rộng cho Express
└── utils/             # JWT, crypto, HTTP helpers
```

## Cài đặt

```bash
npm install
```

Tạo file `.env` ở root:

```env
PORT=9999
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017
MONGO_DB=ts_homework_ex4

JWT_ACCESS_TOKEN=your_access_secret
JWT_REFRESH_TOKEN=your_refresh_secret

ACCESS_TOKEN_TTL_SECONDS=900
REFRESH_TOKEN_TTL_SECONDS=9000
REFRESH_COOKIE_NAME=rt
```

> Bắt buộc: `JWT_ACCESS_TOKEN`, `JWT_REFRESH_TOKEN`, `MONGODB_URI`, `MONGO_DB`.

## Chạy dự án

```bash
npm run dev
```

Lệnh này chạy song song `tsc --watch` và `node --watch ./dist/index.js`.

---

## API Reference

Base URL: `http://localhost:9999`

### Health

```
GET /health  →  { "ok": true }
```

---

### Auth — `/api/auth`

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| POST | `/api/auth/login` | — | Đăng nhập, trả về `accessToken` + set refresh cookie |
| POST | `/api/auth/refresh` | Cookie | Cấp access token mới (token rotation) |
| POST | `/api/auth/logout` | Cookie | Thu hồi refresh token, xóa cookie |

Gọi API bảo vệ bằng header:

```
Authorization: Bearer <accessToken>
```

---

### User — `/api/users`

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| GET | `/api/users` | — | Danh sách user |
| POST | `/api/users/register` | — | Đăng ký |
| GET | `/api/users/:id` | Bearer | Chi tiết user |
| GET | `/api/users/by-email/:email` | Bearer | Tìm theo email |
| PUT | `/api/users/:id` | Bearer | Cập nhật toàn bộ |
| PATCH | `/api/users/:id` | Bearer (chính chủ) | Cập nhật một phần |
| DELETE | `/api/users/:id` | Bearer + admin | Xóa user |

**Quy tắc password:** tối thiểu 6 ký tự, có ít nhất 1 chữ hoa và 1 ký tự đặc biệt.

---

### Product — `/api/products`

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| GET | `/api/products` | Bearer | Danh sách sản phẩm (có filter, phân trang) |
| GET | `/api/products/:id` | Bearer | Chi tiết sản phẩm |
| POST | `/api/products` | Bearer + admin | Tạo sản phẩm |
| PUT | `/api/products/:id` | Bearer + admin | Cập nhật toàn bộ |
| PATCH | `/api/products/:id` | Bearer + admin | Cập nhật một phần |
| DELETE | `/api/products/:id` | Bearer + admin | Xóa sản phẩm |

**Query params cho `GET /api/products`:**

| Param | Kiểu | Mô tả |
|-------|------|-------|
| `q` | string | Tìm theo title |
| `category` | string | Lọc theo danh mục |
| `tags` | string | Tags cách nhau bởi dấu phẩy |
| `minPrice` / `maxPrice` | number | Lọc khoảng giá |
| `sort` | `newest` \| `price_asc` \| `price_desc` | Sắp xếp (mặc định: `newest`) |
| `page` / `limit` | number | Phân trang (mặc định: `1` / `20`) |

---

### Chat — `/api/chat`

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| GET | `/api/chat/messages` | — | Lịch sử tin nhắn |

Query: `limit` (mặc định `50`, tối đa `200`), `before` (ISO date — lấy tin nhắn trước mốc này).

---

## WebSocket

Kết nối tại `/ws`, truyền access token qua query string:

```
ws://localhost:9999/ws?token=<ACCESS_TOKEN>
```

Gửi tin nhắn:

```json
{ "type": "message", "text": "Xin chào" }
```

Server broadcast đến tất cả client:

```json
{ "type": "message", "data": { "id": "...", "userEmail": "...", "role": "customer", "text": "...", "createdAt": "..." } }
```

---

## Ghi chú

- Kiểu `currency` của sản phẩm hiện là `"USE0" | "VND"` — `"USE0"` có thể là typo của `"USD"`.
- Script `test` chưa được triển khai.
