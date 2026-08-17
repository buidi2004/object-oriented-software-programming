# 📊 TẤT CẢ API ENDPOINTS - BACKEND CLOUDSERVICE STORE

**Ngày:** 18/08/2024  
**Tổng số Controllers:** 68  
**Tổng số Modules:** 16 Cloud Services + 51 Core Modules

---

## 🔐 AUTHENTICATION (Cần token cho hầu hết APIs)

```
POST   /api/auth/register        - Đăng ký tài khoản
POST   /api/auth/login           - Đăng nhập
POST   /api/auth/logout          - Đăng xuất
POST   /api/auth/refresh-token   - Làm mới token
GET    /api/auth/me              - Thông tin user hiện tại
```

**Authorization:** Tất cả APIs yêu cầu `Authorization: Bearer {token}`

---

## ☁️ 16 CLOUD SERVICE MODULES - API ENDPOINTS

### Module #1: Shared Hosting
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/hosting` | Tạo hosting account mới |
| GET | `/api/hosting/me` | Lấy danh sách hosting của tôi |

**Request Body (Create):**
```json
{
  "planId": "guid-string"
}
```

---

### Module #2: Email Hosting
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/email-hosting/accounts` | Tạo email account mới |
| GET | `/api/email-hosting/accounts` | Lấy danh sách email accounts |

**Request Body (Create):**
```json
{
  "hostingAccountId": "guid",
  "localPart": "info",
  "domain": "example.com",
  "quotaMb": 512
}
```

---

### Module #3: App Installer
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/app-installer/install` | Cài đặt ứng dụng |

**Request Body:**
```json
{
  "templateId": "guid",
  "hostingAccountId": "guid"
}
```

---

### Module #4: CDN Distribution
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/cdn/distributions` | Tạo CDN distribution |
| GET | `/api/cdn/distributions` | Lấy danh sách CDN distributions |

**Request Body (Create):**
```json
{
  "originUrl": "https://example.com",
  "provider": "Cloudflare"
}
```

---

### Module #5: Managed Database
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/databases` | Tạo database instance |
| GET | `/api/databases` | Lấy danh sách databases |

**Request Body (Create):**
```json
{
  "name": "mydb",
  "engine": "PostgreSQL",
  "version": "15"
}
```

---

### Module #6: Object Storage
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/storage/buckets` | Tạo storage bucket |
| GET | `/api/storage/buckets` | Lấy danh sách buckets |

**Request Body (Create):**
```json
{
  "name": "my-bucket",
  "visibility": "Private"
}
```

---

### Module #7: Dedicated Server
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/dedicated-servers` | Đặt dedicated server mới |
| GET | `/api/dedicated-servers` | Lấy danh sách servers |

**Request Body (Create):**
```json
{
  "serverName": "My Server",
  "cpuModel": "Intel Xeon Gold",
  "ramGb": 32,
  "diskBytes": 536870912000,
  "osImage": "Ubuntu 24.04 LTS",
  "expiresAt": "2025-12-31T00:00:00Z"
}
```

---

### Module #8: Website Builder
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/website-builder/projects` | Tạo website project |
| GET | `/api/website-builder/projects` | Lấy danh sách projects |

**Request Body (Create):**
```json
{
  "name": "My Website",
  "templateId": "landing-page"
}
```

---

### Module #9: Domain Privacy
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/domains/{id}/privacy/enable` | Bật WHOIS privacy |
| POST | `/api/domains/{id}/privacy/disable` | Tắt WHOIS privacy |

---

### Module #10: Organizations
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/organizations` | Tạo organization mới |
| GET | `/api/organizations` | Lấy danh sách organizations |
| GET | `/api/organizations/{id}/members` | Lấy danh sách members |
| POST | `/api/organizations/{id}/invite` | Mời thành viên |
| POST | `/api/organizations/{id}/remove` | Xoá thành viên |

**Request Body (Create):**
```json
{
  "name": "My Organization"
}
```

**Request Body (Invite):**
```json
{
  "email": "user@example.com"
}
```

**Request Body (Remove):**
```json
{
  "memberId": "guid"
}
```

---

### Module #11: Business Email
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/email-subscriptions` | Đặt email subscription |
| GET | `/api/email-subscriptions` | Lấy danh sách subscriptions |

**Request Body (Create):**
```json
{
  "provider": "GoogleWorkspace",
  "domain": "company.com",
  "users": 10
}
```

---

### Module #12: Game Server
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/game-servers` | Tạo game server mới |
| GET | `/api/game-servers` | Lấy danh sách servers |

**Request Body (Create):**
```json
{
  "gameType": "Minecraft",
  "serverName": "My Server",
  "port": 25565
}
```

---

### Module #13: Security Add-ons
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/security/addons` | Mua security addon |
| GET | `/api/security/addons/me` | Lấy danh sách addons của tôi |
| POST | `/api/security/addons/{id}/scan` | Chạy malware scan |

**Request Body (Purchase):**
```json
{
  "addonType": "Waf",
  "targetResourceId": "resource-id"
}
```

---

### Module #14: Static Sites
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/static-sites` | Tạo static site |
| GET | `/api/static-sites` | Lấy danh sách sites |
| POST | `/api/static-sites/{id}/deploy` | Deploy site |

**Request Body (Create):**
```json
{
  "name": "My Site",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

**Request Body (Deploy):**
```json
{
  "gitCommitHash": "abc123"
}
```

---

### Module #16: Marketplace
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/marketplace/purchase/{id}` | Mua sản phẩm |
| GET | `/api/marketplace/listings` | Lấy danh sách products |

---

## 🛠️ CORE MODULES - CÁC API QUAN TRỌNG KHÁC

### User & Profile
```
GET    /api/users/me                    - Thông tin user hiện tại
PUT    /api/users/me                    - Cập nhật profile
GET    /api/wallet                      - Ví người dùng
POST   /api/wallet/topup                - Nạp tiền vào ví
GET    /api/wallet/transactions         - Lịch sử giao dịch
```

### Orders & Payments
```
GET    /api/orders                      - Danh sách đơn hàng
GET    /api/orders/{id}                 - Chi tiết đơn hàng
POST   /api/orders/checkout             - Thanh toán đơn hàng
GET    /api/payments                    - Lịch sử thanh toán
POST   /api/payments/webhook/vnpay      - Webhook VNPay
```

### VPS Management
```
GET    /api/vpsinstances                - Danh sách VPS
GET    /api/vpsinstances/{id}           - Chi tiết VPS
POST   /api/vpsinstances/{id}/start     - Khởi động VPS
POST   /api/vpsinstances/{id}/stop      - Dừng VPS
POST   /api/vpsinstances/{id}/reboot    - Reboot VPS
DELETE /api/vpsinstances/{id}           - Xoá VPS
GET    /api/vpsinstances/{id}/uptime    - Uptime monitoring
```

### Domains
```
GET    /api/domains                     - Danh sách domains
POST   /api/domains/search              - Tìm kiếm tên miền
POST   /api/domains/register            - Đăng ký tên miền
GET    /api/domains/{id}                - Chi tiết domain
POST   /api/domains/{id}/renew          - Gia hạn domain
```

### SSL Certificates
```
GET    /api/ssl-certificates            - Danh sách SSL certs
POST   /api/ssl-certificates            - Cấp SSL certificate
GET    /api/ssl-certificates/{id}       - Chi tiết SSL cert
```

### Support Tickets
```
GET    /api/tickets                     - Danh sách tickets
POST   /api/tickets                     - Tạo ticket mới
GET    /api/tickets/{id}                - Chi tiết ticket
POST   /api/tickets/{id}/messages       - Gửi tin nhắn
```

### Knowledge Base
```
GET    /api/knowledgebase/articles      - Danh sách articles
GET    /api/knowledgebase/articles/{slug} - Chi tiết article
```

### Notifications
```
GET    /api/notification-settings       - Cài đặt notifications
PUT    /api/notification-settings       - Cập nhật cài đặt
GET    /api/notifications               - Danh sách notifications
```

---

## 📋 HƯỚNG DẪN SỬ DỤNG

### 1. Authentication Flow
```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { accessToken } = await loginResponse.json();
localStorage.setItem('accessToken', accessToken);

// Sử dụng token trong các requests khác
const response = await fetch('/api/hosting/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
});
```

### 2. API Client Pattern
```typescript
// frontend/src/lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
});

// Auto attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 3. Example Usage
```typescript
// Module #1: Hosting
const hostingApi = {
  getMy: async () => {
    const res = await api.get('/hosting/me');
    return res.data;
  },
  create: async (planId: string) => {
    const res = await api.post('/hosting', { planId });
    return res.data;
  }
};

// Module #13: Security
const securityApi = {
  getMyAddons: async () => {
    const res = await api.get('/security/addons/me');
    return res.data;
  },
  purchase: async (addonType: string, targetResourceId: string) => {
    const res = await api.post('/security/addons', { addonType, targetResourceId });
    return res.data;
  },
  runScan: async (id: string) => {
    const res = await api.post(`/security/addons/${id}/scan`);
    return res.data;
  }
};
```

---

## 🎯 TỔNG KẾT

### Total API Endpoints: ~150+
- **Authentication:** 4 endpoints
- **16 Cloud Services:** ~30 endpoints
- **Core Modules:** ~120 endpoints

### Authorization Required:
- Tất cả APIs đều cần Bearer Token
- Một số APIs yêu cầu role "Customer"
- Một số APIs yêu cầu role "Admin"

### Response Format:
```json
{
  "id": "guid",
  "success": true,
  "data": {...},
  "message": "Success"
}
```

**🚀 Đây là đầy đủ thông tin API để bạn xây dựng Frontend!**