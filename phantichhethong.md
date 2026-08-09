

PHÂN TÍCH & THIẾT KẾ HỆ THỐNG
Bản tối ưu — Website Bán Dịch Vụ Cloud
IN4211 — Bài tập lớn cuối kỳ

Bản này giữ lại toàn bộ nội dung phân tích, quyết định kiến trúc, schema, API spec, chiến lược bảo mật/testing/CI-CD/indexing — nhưng loại bỏ code mẫu để dùng viết báo cáo (báo cáo nên diễn giải bằng lời + bảng/sơ đồ, code minh hoạ để riêng ở phụ lục hoặc repo). Mục 7 đã bổ sung đủ 32 module Nhóm C để đạt tổng 50 module.

MỤC LỤC

0. PHẠM VI TÀI LIỆU
   Thiết kế kỹ thuật cho 18 module Nhóm B (nhóm entity cần code thật) trong tổng 50 module của đề — đủ khối lượng cho 4 thành viên trong 12 buổi. Đọc tuần tự Mục 1 → 17 khi lần đầu tiếp cận, sau đó dùng tra cứu khi phân công.
   0.1 Vì sao chọn CQRS + Mediator thay vì kiến trúc phân lớp truyền thống (N-tier)?
   Đây là câu hỏi gần như chắc chắn bị hỏi khi vấn đáp, nên cần trả lời được bằng lập luận đánh đổi (trade-off), không chỉ nêu định nghĩa.
   Cái giá phải trả khi chọn CQRS (nên thừa nhận thẳng, không né tránh khi vấn đáp):
   • Số lượng file tăng đáng kể so với kiến trúc Controller → Service → Repository truyền thống (mỗi nghiệp vụ nhỏ nhất cũng cần Command/Query + Handler + Validator riêng) — với một hệ thống nhỏ, đây là chi phí thừa.
   • Phải duy trì đồng thời 2 công nghệ truy cập dữ liệu (EF Core cho ghi, Dapper cho đọc) — tăng đường cong học tập và diện tích bề mặt lỗi.
   • Nếu nhóm không quen MediatR/pipeline behavior, thời gian buổi 4 dựng khung sườn có thể kéo dài hơn dự kiến.
   Cái được, và vì sao vẫn đáng đánh đổi với đề này cụ thể:
   • Đề yêu cầu tối thiểu 3 design pattern và có tiêu chí "kiến trúc + SOLID" chiếm 20 điểm — CQRS + Mediator tự nhiên kéo theo Decorator (pipeline behavior) và tách bạch rõ Single Responsibility, nên 1 quyết định kiến trúc thoả được nhiều tiêu chí điểm cùng lúc thay vì phải chèn pattern gượng ép vào code.
   • Việc 4 thành viên làm việc song song ít đụng độ hơn: mỗi người sở hữu trọn 1 Feature (Command + Query + Test riêng của feature đó), giảm xung đột merge so với kiến trúc Service dùng chung 1 class lớn nhiều người cùng sửa.
   • Nhánh đọc dùng Dapper cho phép viết SQL tối ưu tay cho các màn hình danh sách có phân trang/lọc/sắp xếp phức tạp (danh sách gói dịch vụ, đơn hàng) — đây đúng là loại truy vấn nặng nhất của hệ thống bán hàng, nên tách riêng khỏi nhánh ghi là hợp lý về hiệu năng, không phải chỉ để "cho đúng pattern".
   Lưu ý khi trả lời vấn đáp: nếu giám khảo hỏi "hệ thống nhỏ thế này có cần CQRS không?" — câu trả lời an toàn nhất là thừa nhận CQRS là over-engineering nếu xét thuần về quy mô dữ liệu, nhưng nhóm chọn có chủ đích vì (1) khớp tiêu chí chấm điểm về pattern/SOLID, và (2) mô phỏng đúng cách một hệ thống thật sẽ tách nhánh đọc/ghi khi cần mở rộng sau này — chứ không phải chọn bừa vì "nghe có vẻ hay".
1. CHIẾN LƯỢC ĐIỂM SỐ
   Tiêu chí (đề)
   Điểm
   Mục chứng minh
   Kiến trúc + SOLID + Design Patterns
   20
   Mục 2, 3
   Backend API chuẩn REST
   20
   Mục 4, 5
   Frontend responsive
   15
   Ngoài phạm vi tài liệu
   Bảo mật
   10
   Mục 6
   Unit Testing ≥15
   10
   Mục 9
   Git + CI/CD + Docker
   10
   Mục 10, 11
   Báo cáo + Demo
   10
   Toàn tài liệu
   Vấn đáp
   5
   Mỗi TV phụ trách trọn 1 Feature
   Deploy
   +5
   Mục 11
2. KIẾN TRÚC CQRS — LOGIC & LUỒNG XỬ LÝ (không code)
   2.1 Phân lớp thư mục (mô tả)
   • Domain: chứa 20 entity, các enum trạng thái (đơn hàng, thanh toán, ticket, độ ưu tiên), các domain event (tạo đơn, thanh toán thành công, có review mới, ticket được trả lời), và các interface trừu tượng (repository, unit of work, dapper context).
   • Application: chia theo Feature (Auth, ServicePlans, Carts, Payments, Coupons, Reviews, Tickets, Security, Dashboard), mỗi feature có Command và Query riêng. Có thêm tầng Pipeline Behavior (validate, log, cache, đo hiệu năng) và các interface cho dịch vụ ngoài (cổng thanh toán, gửi email, sinh QR, lấy thông tin user hiện tại).
   • Infrastructure: hiện thực EF Core cho nhánh ghi (Command), Dapper cho nhánh đọc (Query), tích hợp cổng thanh toán VNPay/Momo, gửi email, sinh QR code, và cache (bộ nhớ hoặc Redis).
   • WebApi: chứa Controller mỏng (chỉ gọi Mediator), middleware xử lý lỗi và giới hạn tốc độ request, filter xác thực khoá API cho webhook.
   2.2 Pipeline xử lý 1 request — mô tả tuần tự
   1. Request đi qua middleware giới hạn tốc độ (chặn brute-force trước khi vào hệ thống).
   2. Middleware xác thực JWT, gán thông tin người dùng vào ngữ cảnh request.
   3. Controller/endpoint kiểm tra vai trò (role) được phép truy cập.
   4. Controller chuyển tiếp request cho Mediator xử lý — bản thân Controller không chứa logic nghiệp vụ.
   5. Trong Mediator, request lần lượt đi qua các "hành vi" (behavior) được xếp thành chuỗi: kiểm tra dữ liệu đầu vào (trả lỗi 400 sớm nếu sai) → ghi log thời gian xử lý → kiểm tra cache (chỉ áp dụng cho Query được đánh dấu có thể cache) → cảnh báo nếu handler xử lý quá chậm (trên 500ms).
   6. Handler tương ứng thực thi nghiệp vụ thật sự.
   7. Nếu có lỗi ở bất kỳ bước nào, middleware xử lý lỗi tập trung sẽ bắt và trả về theo chuẩn ProblemDetails, kèm mã lỗi HTTP phù hợp (400 dữ liệu sai, 404 không tìm thấy, 403 không có quyền, 500 lỗi hệ thống).
      2.3 Ý nghĩa của việc tách Command/Query
      Nhánh ghi (Command, dùng EF Core) tập trung vào tính đúng đắn nghiệp vụ và ràng buộc dữ liệu (transaction, validate). Nhánh đọc (Query, dùng Dapper viết SQL thô) tối ưu cho tốc độ trả về, hỗ trợ phân trang/lọc/sắp xếp linh hoạt mà không phải đi qua toàn bộ object graph của EF Core — phù hợp với các màn hình danh sách (danh sách gói dịch vụ, danh sách đơn hàng có lọc theo trạng thái/khoảng ngày).
      Vì sao không dùng luôn EF Core cho cả đọc lẫn ghi (đơn giản hơn)? Vì EF Core khi truy vấn danh sách có nhiều điều kiện lọc động (ví dụ lọc đơn hàng theo trạng thái *và* khoảng ngày *và* phân trang cùng lúc) thường sinh ra câu lệnh LINQ phức tạp, khó kiểm soát chỉ mục nào được dùng, và dễ kéo theo dữ liệu thừa nếu không cấu hình AsNoTracking/Select cẩn thận. Dapper cho phép viết đúng 1 câu SQL tối ưu, biết chính xác cột nào được chọn, join nào cần thiết — vừa nhanh hơn vừa dễ giải thích khi vấn đáp bằng cách chỉ ra kế hoạch thực thi (execution plan) của câu SQL đó. Đánh đổi là phải viết SQL tay và tự chịu trách nhiệm chống SQL injection (bắt buộc dùng tham số hoá, không nối chuỗi).
      Ranh giới rõ ràng cần giữ khi code: Command không bao giờ trả về dữ liệu đã được join/tổng hợp phức tạp — chỉ trả DTO tối thiểu xác nhận thao tác đã thành công (id vừa tạo, trạng thái mới). Ngược lại Query không bao giờ thực hiện ghi dữ liệu, kể cả ghi log nghiệp vụ (ghi log kỹ thuật/performance qua behavior thì được, vì đó không phải nghiệp vụ). Vi phạm ranh giới này là lỗi thường gặp nhất khiến CQRS "nửa vời" — giám khảo có kinh nghiệm sẽ hỏi thẳng vào đây.
      2.4 Idempotency cho Payment Webhook — vì sao cần và xử lý ra sao
      Cổng thanh toán (VNPay/Momo) có thể gọi webhook nhiều lần cho cùng một giao dịch do cơ chế retry mạng của chính cổng thanh toán. Nếu hệ thống không kiểm soát, một giao dịch có thể bị xác nhận (và gửi email, cộng doanh thu) nhiều lần.
      Giải pháp: mỗi Payment được sinh một IdempotencyKey duy nhất ngay khi tạo lệnh thanh toán, gửi kèm sang cổng thanh toán, và cổng thanh toán trả lại đúng key đó khi gọi webhook. Khi webhook đến, hệ thống tra Payment theo key này: nếu trạng thái đã là "Confirmed" thì bỏ qua không xử lý lại; chỉ khi trạng thái còn "Pending" mới cập nhật thành công và phát sinh sự kiện thanh toán thành công (kích hoạt gửi email xác nhận). Trường IdempotencyKey cần có unique index trong database để đảm bảo tuyệt đối không có 2 bản ghi trùng key.
3. DESIGN PATTERNS ÁP DỤNG (đề yêu cầu tối thiểu 3, tài liệu chứng minh 8)

Pattern
Áp dụng ở đâu
Vì sao cần
1
CQRS + Mediator
Toàn Application layer
Tách rõ luồng ghi/đọc, dễ mở rộng, dễ test riêng từng handler
2
Repository + Unit of Work
Nhánh ghi (EF Core)
Trừu tượng hoá thao tác DB, gom nhiều thay đổi vào 1 transaction
3
Strategy
IPaymentGateway với 2 hiện thực VNPay/Momo
Thêm cổng thanh toán mới không sửa code hiện có
4
Factory
Sinh QR code theo loại đối tượng (gói dịch vụ, đơn hàng...)
Đóng gói logic tạo đối tượng phức tạp
5
Observer (Domain Events)
Sự kiện tạo đơn, thanh toán thành công, ticket được trả lời
Tách hành động phụ (gửi email, ghi log) khỏi luồng nghiệp vụ chính
6
Decorator
Các pipeline behavior (validate, log, cache)
"Bọc" quanh handler mà handler không biết — đúng tinh thần Open/Closed
7
Singleton
Factory kết nối cho Dapper, cấu hình logging
Dùng chung 1 instance cho toàn ứng dụng
8
Specification (nâng cao, tuỳ chọn)
Xây điều kiện lọc tái sử dụng cho truy vấn đơn hàng có nhiều điều kiện
Tránh lặp logic lọc ở nhiều nơi
Khi viết báo cáo: chỉ cần trình bày sâu 4–5 pattern đầu (CQRS, Repository/UoW, Strategy, Observer, Decorator), pattern #7 và #8 nêu ngắn gọn 1–2 câu.
4. DOMAIN MODEL — 20 Entity
4.0 Quan hệ tổng quan (mô tả ERD)
    • Một Role có nhiều AppUser.
    • Một AppUser có thể là tác giả nhiều NewsArticle, đặt nhiều OrderRequest, nộp nhiều AffiliateApplication, thực hiện nhiều AuditLog, sở hữu 1 Cart đang active, viết nhiều Review, tạo nhiều SupportTicket (vai trò khách hàng) hoặc xử lý nhiều ticket (vai trò nhân viên), gửi nhiều TicketMessage, có nhiều LoginHistory và UserSession, và có đúng 1 NotificationSetting.
    • Một ServiceCategory phân loại nhiều ServicePlan. Một ServicePlan có nhiều mức giá theo chu kỳ (PlanPrice), có thể có nhiều khuyến mãi (Promotion, có thể null nghĩa là áp dụng toàn site), được thêm vào nhiều giỏ hàng, được đặt trong nhiều đơn hàng, và được đánh giá nhiều lần.
    • Một Cart chứa nhiều CartItem.
    • Một OrderRequest có đúng 1 Payment (quan hệ 1-1), và có thể áp dụng 1 Coupon (nullable). Một Coupon có thể được dùng cho nhiều đơn hàng.
    • Một SupportTicket chứa nhiều TicketMessage.
Hai điểm thiết kế quan trọng rút ra từ quan hệ trên (dễ bị bỏ sót nếu chỉ đọc bảng field rời rạc):
    • Vì OrderRequest chỉ có 1 Payment, khi thanh toán thất bại và khách thử lại, hệ thống phải tạo Payment mới gắn vào cùng OrderRequest cũ, không được tạo OrderRequest mới — nếu không sẽ đếm trùng doanh thu và số đơn hàng.
    • Quan hệ Coupon–OrderRequest là 1-nhiều: một mã giảm giá dùng được cho nhiều đơn, nhưng mỗi đơn chỉ áp được tối đa một mã.
4.1 Nhóm lõi (từ đề gốc)
Entity
Trường chính
Ghi chú
AppUser
Id, FullName, Email (unique), PasswordHash (BCrypt), PhoneNumber, RoleId, IsActive, CreatedAt

Role
Id, Name
Admin / Editor / Customer
ServiceCategory
Id, Name, Slug (unique)

ServicePlan
Id, CategoryId, Name, Cpu/Ram/Ssd/Bandwidth, QrCodeUrl, IsActive
QR sinh bởi Factory Pattern
PlanPrice
Id, ServicePlanId, BillingCycle (monthly/yearly), Price, EffectiveFrom
Index (ServicePlanId, BillingCycle)
Promotion
Id, ServicePlanId (nullable = toàn site), DiscountPercent, StartDate, EndDate

NewsArticle
Id, Title, Slug (unique), Content, AuthorId, Status (Draft/Published)

OrderRequest
Id, UserId, ServicePlanId, BillingCycle, Status, CouponId (nullable), DiscountAmount, SubTotal, TotalAmount, CreatedAt
TotalAmount = SubTotal − DiscountAmount, luôn kiểm chứng được vì DiscountAmount là snapshot
AffiliateApplication
Id, UserId, CompanyName, Status, CommissionRate

AuditLog
Id, UserId, Action, EntityName, EntityId, IpAddress, Timestamp
IpAddress dùng varchar(45) để hỗ trợ IPv6
4.2 Nhóm mở rộng — 10 entity cần code
Entity
Trường chính
Ghi chú
Cart
Id, UserId (unique), Status (Active/CheckedOut)
Mỗi user chỉ có 1 cart active
CartItem
Id, CartId, ServicePlanId, BillingCycle, Quantity

Payment
Id, OrderRequestId, Gateway, TransactionRef (unique), IdempotencyKey (unique), Amount, Status, CreatedAt, ConfirmedAt
Xem Mục 2.4
Coupon
Id, Code (unique), DiscountPercent, MaxUsage, UsedCount, ExpiryDate, IsActive
UsedCount phải tăng trong cùng transaction với việc tạo OrderRequest để tránh race condition khi nhiều khách dùng chung coupon sắp hết lượt
Review
Id, ServicePlanId, UserId, Rating (1–5), Comment, IsApproved (mặc định false)

SupportTicket
Id, UserId, AssignedStaffId (nullable), Subject, Status, Priority

TicketMessage
Id, TicketId, SenderId, Message, CreatedAt

LoginHistory
Id, UserId, IpAddress, UserAgent, IsSuccess, LoginAt
Index (UserId, LoginAt)
UserSession
Id, UserId, RefreshTokenHash, DeviceInfo, ExpiresAt, IsRevoked
Không bao giờ lưu token thô
NotificationSetting
Id, UserId (unique), EmailOnOrder, EmailOnSecurity, EmailOnPromotion
Quan hệ 1-1 với AppUser
5. REST API SPECIFICATION — 65 endpoint
5.1 Nghiệp vụ khách hàng (40 endpoint)
Method
Route
Quyền
Mã trả về
POST
/api/auth/register
Public
201, 400
POST
/api/auth/login
Public
200, 401
POST
/api/auth/refresh-token
Public (cookie)
200, 401
GET
/api/service-plans
Public
200
GET
/api/service-plans/{id}
Public
200, 404
GET
/api/service-plans/compare
Public
200
GET
/api/carts/me
Customer
200
POST
/api/carts/items
Customer
200, 400
PUT
/api/carts/items/{id}
Customer
200, 404
DELETE
/api/carts/items/{id}
Customer
204, 404
POST
/api/coupons/apply
Customer
200, 400
GET
/api/coupons
Admin
200
POST
/api/coupons
Admin
201, 400
PATCH
/api/coupons/{id}/deactivate
Admin
204, 404
POST
/api/orders/checkout
Customer
201, 400, 409
POST
/api/payments
Customer
201
POST
/api/payments/webhook/{gateway}
ApiKey + chữ ký gateway
200, 400, 409
GET
/api/payments/{id}/status
Customer
200, 404
GET
/api/orders/me
Customer
200
GET
/api/orders
Admin (lọc theo status/khoảng ngày)
200
PATCH
/api/orders/bulk-status
Admin
204
POST
/api/reviews
Customer
201, 400
GET
/api/service-plans/{id}/reviews
Public
200
GET
/api/reviews/pending
Admin
200
PATCH
/api/reviews/{id}/approve
Admin
204, 404
PATCH
/api/reviews/{id}/reject
Admin
204, 404
POST
/api/tickets
Customer
201
POST
/api/tickets/{id}/messages
Customer/Admin
201, 404
PATCH
/api/tickets/{id}/close
Customer/Admin
204
GET
/api/tickets/me
Customer
200
GET
/api/tickets/queue
Admin
200
PATCH
/api/tickets/{id}/assign
Admin
204
GET
/api/security/login-history
Customer
200
GET
/api/security/sessions
Customer
200
DELETE
/api/security/sessions/{id}
Customer
204, 404
GET
/api/dashboard/me
Customer
200
GET
/api/dashboard/revenue-stats
Admin
200
GET
/api/dashboard/order-trend
Admin
200
GET
/api/notification-settings/me
Customer
200
PUT
/api/notification-settings/me
Customer
200
Luồng checkout (POST /api/orders/checkout): chuyển toàn bộ CartItem đang active của user thành 1 OrderRequest, snapshot giá tại thời điểm chốt đơn vào SubTotal/TotalAmount (không tham chiếu lại giá gói sau này), áp CouponId nếu có, rồi đánh dấu giỏ hàng đã checkout. Trả về 409 Conflict nếu giỏ hàng rỗng hoặc coupon vừa hết lượt trong lúc thao tác.
5.2 Quản trị & nội dung (25 endpoint)
Method
Route
Quyền
Mã trả về
GET
/api/categories
Public
200
POST
/api/categories
Admin
201, 400
PUT
/api/categories/{id}
Admin
200, 404
DELETE
/api/categories/{id}
Admin
204, 409 nếu còn ServicePlan tham chiếu
POST
/api/service-plans
Admin, Editor
201, 400
PUT
/api/service-plans/{id}
Admin, Editor
200, 404
PATCH
/api/service-plans/{id}/deactivate
Admin
204, 404
GET
/api/promotions
Admin
200
POST
/api/promotions
Admin
201, 400
PUT
/api/promotions/{id}
Admin
200, 404
DELETE
/api/promotions/{id}
Admin
204, 404
GET
/api/news
Public (chỉ Published) / Admin,Editor (mọi status)
200
GET
/api/news/{slug}
Public
200, 404
POST
/api/news
Admin, Editor
201, 400
PUT
/api/news/{id}
Admin, Editor
200, 404
PATCH
/api/news/{id}/publish
Admin, Editor
204, 404
DELETE
/api/news/{id}
Admin
204, 404
POST
/api/affiliate-applications
Customer
201, 400, 409 nếu đã có đơn Pending
GET
/api/affiliate-applications
Admin
200
PATCH
/api/affiliate-applications/{id}/approve
Admin
204, 404
PATCH
/api/affiliate-applications/{id}/reject
Admin
204, 404
GET
/api/audit-logs
Admin
200
GET
/api/users
Admin
200
PATCH
/api/users/{id}/lock
Admin
204, 404
PATCH
/api/users/{id}/role
Admin
204, 404
Toàn bộ response lỗi đi qua middleware xử lý lỗi tập trung, trả về đúng chuẩn application/problem+json.
6. BẢO MẬT CHUYÊN SÂU (map 10đ)
6.1 Cấu trúc JWT
Access token sống 15 phút, không lưu trong DB, mang thông tin định danh (UserId, Email, Role, thời gian hết hạn). Refresh token sống 7 ngày; chỉ lưu bản băm (hash) của refresh token trong DB, token thô chỉ trả về client đúng 1 lần và không bao giờ được log lại.
6.2 Refresh Token Rotation — chống replay attack
Mỗi lần client gọi API làm mới token: hệ thống so khớp hash của token gửi lên với hash lưu trong session. Nếu khớp và còn hạn, hệ thống cấp access token mới và refresh token mới, đồng thời vô hiệu hoá refresh token cũ ngay lập tức. Nếu một refresh token đã bị vô hiệu hoá mà vẫn được gửi lên lần nữa — đây là dấu hiệu token đã bị đánh cắp và dùng lại — hệ thống thu hồi toàn bộ session của người dùng đó, buộc phải đăng nhập lại từ đầu.
6.3 Giới hạn tốc độ (Rate Limiting)
Endpoint đăng nhập giới hạn tối đa 5 lần thử trong 15 phút, vượt quá bị chặn ngay (429) chứ không xếp hàng chờ — nhằm chống dò mật khẩu. Endpoint áp mã giảm giá cũng cần một chính sách giới hạn nhẹ hơn (ví dụ 20 lần/15 phút) — vì mã coupon thường ngắn và dễ đoán hơn mật khẩu, nếu không giới hạn sẽ bị lợi dụng để dò mã hợp lệ.
6.4 Tổng hợp yêu cầu — cách đáp ứng
Yêu cầu đề
Cách đáp ứng
JWT + refresh token
Mục 6.1, 6.2
Phân quyền Admin/Editor
Kiểm tra role ở tầng endpoint, kiểm tra lại lần nữa trong handler (defense in depth)
Băm mật khẩu
BCrypt, work factor 12
QR code
Sinh qua Factory Pattern
Ghi IP đăng nhập
Đọc header chuyển tiếp vì hệ thống chạy sau reverse proxy trong Docker
Chống brute-force
Mục 6.3
Xác thực webhook thanh toán
Mục 6.5
CORS cho Frontend domain riêng
Mục 6.6
6.5 Xác thực chữ ký Webhook — lý do và nguyên tắc
Chỉ kiểm tra khoá API (API key) là chưa đủ: nếu khoá này bị lộ (qua log, cấu hình CORS sai, hoặc bị nghe lén trên mạng dev), kẻ tấn công vẫn có thể giả một webhook báo "thanh toán thành công" cho đơn hàng của người khác mà không cần thanh toán thật. Vì vậy, mọi webhook từ cổng thanh toán thật (VNPay/Momo) đều mang kèm một chữ ký mã hoá (HMAC) trên toàn bộ dữ liệu gửi lên, và hệ thống bắt buộc phải xác minh chữ ký này trước khi đọc bất kỳ trường dữ liệu nào (kể cả IdempotencyKey). Nếu chữ ký sai, trả về lỗi 400 ngay và không được chạm vào database. Việc so sánh chữ ký cũng cần dùng phép so sánh có thời gian cố định (không phụ thuộc độ dài chuỗi trùng khớp) để tránh bị dò ra bằng tấn công timing. Đây là điểm hay bị hỏi khi vấn đáp vì nó chứng minh hiểu payment gateway thật chứ không chỉ mock giả lập.
6.6 CORS — vì sao cần và nguyên tắc cấu hình
Vì Frontend chạy trên domain/port khác Backend, cần bật CORS cho đúng domain của Frontend (không dùng "cho phép tất cả nguồn" một cách tuỳ tiện). Lưu ý quan trọng: nếu hệ thống cho phép gửi cookie kèm request (cần thiết khi refresh token đi qua cookie), thì không được đồng thời cho phép "bất kỳ nguồn nào" — hai cấu hình này xung đột nhau và trình duyệt sẽ tự chặn. Đây là lỗi rất hay gặp khi nhóm mới tích hợp Frontend/Backend lần đầu.
6.7 Threat model theo nhóm endpoint — tư duy tấn công/phòng thủ
Trình bày bảo mật theo hướng "liệt kê cơ chế đã dùng" (JWT, BCrypt, rate limit...) chỉ được điểm ở mức mô tả. Để đạt điểm sâu hơn khi vấn đáp, nên trình bày theo hướng ngược lại: với mỗi nhóm endpoint, kẻ tấn công sẽ nhắm vào đâu, và cơ chế nào trong Mục 6.1–6.6 chặn đúng lỗ hổng đó.
Nhóm endpoint
Kịch bản tấn công có thể xảy ra
Cơ chế phòng thủ tương ứng
/api/auth/login
Dò mật khẩu bằng brute-force hoặc credential stuffing (thử danh sách mật khẩu rò rỉ từ nơi khác)
Giới hạn 5 lần/15 phút (6.3) + băm mật khẩu bằng BCrypt work factor 12 khiến việc dò offline nếu DB bị lộ cũng rất chậm (6.4)
/api/auth/refresh-token
Đánh cắp refresh token (qua XSS, log lộ, hoặc thiết bị bị mất) rồi dùng lại nhiều lần song song với người dùng thật
Refresh Token Rotation: token cũ bị vô hiệu hoá ngay sau lần dùng đầu; nếu token đã vô hiệu hoá bị gửi lại → coi là dấu hiệu bị đánh cắp, thu hồi toàn bộ session (6.2)
/api/coupons/apply
Dò mã giảm giá hợp lệ bằng cách thử hàng loạt mã ngắn (mã coupon thường ngắn hơn mật khẩu nhiều, không dùng biện pháp riêng sẽ bị bỏ sót)
Rate limit riêng, nhẹ hơn login nhưng vẫn giới hạn số lần thử trong khoảng thời gian (6.3)
/api/payments/webhook/{gateway}
Giả lập lời gọi webhook báo "thanh toán thành công" cho một đơn hàng chưa từng thanh toán, hoặc gửi lại webhook thật nhiều lần để trigger xử lý trùng
Xác thực chữ ký HMAC bắt buộc trước khi đọc bất kỳ trường nào (6.5) cộng thêm cơ chế idempotency theo IdempotencyKey (Mục 2.4) — hai lớp độc lập nhau: chữ ký chặn giả mạo nguồn gốc, idempotency chặn xử lý trùng dù nguồn gốc hợp lệ
Các endpoint có [Authorize(Roles="Admin")]
Người dùng thường cố gọi trực tiếp endpoint quản trị bằng cách tự sửa request (Postman, devtools) sau khi có access token hợp lệ của tài khoản Customer
Kiểm tra role ở tầng endpoint và kiểm tra lại lần nữa ngay trong Handler (defense in depth, 6.4) — phòng trường hợp một endpoint bị quên gắn attribute phân quyền
Toàn bộ endpoint nói chung
Tấn công CSRF nếu dùng cookie cho phiên đăng nhập mà không có biện pháp đi kèm
CORS chỉ định đúng domain Frontend, không dùng "any origin" khi đã bật AllowCredentials (6.6) — hai cấu hình xung đột nên trình duyệt tự chặn nếu cấu hình sai, nhưng nhóm vẫn nên hiểu đây không phải "may mắn" mà là cơ chế bảo vệ chủ động
Điểm cộng khi vấn đáp: nếu bị hỏi "còn lỗ hổng nào chưa xử lý?", câu trả lời trung thực và an toàn là: hệ thống chưa xử lý sâu XSS ở tầng Frontend (thoát HTML khi hiển thị nội dung do người dùng nhập như Review/Comment) và chưa có WAF/DDoS protection ở tầng hạ tầng — đây là phạm vi ngoài yêu cầu đề (đề chỉ chấm 10đ bảo mật ở tầng Backend cơ bản), nhưng nhóm hiểu và có thể nêu hướng phát triển nếu được hỏi thêm.
7. PHÂN LOẠI ĐỦ 50 MODULE
18 module Nhóm B cần code thật — đã có schema đầy đủ ở Mục 4 và endpoint đầy đủ ở Mục 5 của tài liệu này. 32 module Nhóm C dưới đây do tài liệu này tự đề xuất bổ sung để đủ 50, theo hướng mở rộng hợp lý cho một website bán dịch vụ Cloud (domain, hosting, thanh toán, marketing, hỗ trợ, quản trị) — dùng cho phần "hướng phát triển" trong báo cáo, không cần code trong 12 buổi.
✅ Bản chính thức: 32 module Nhóm C dưới đây là thiết kế do nhóm tự đề xuất bổ sung từ domain nghiệp vụ chung của một website bán dịch vụ Cloud (hạ tầng, thanh toán, marketing, hỗ trợ, quản trị), dùng cho phần "hướng phát triển" trong báo cáo. Danh sách này không trùng nghiệp vụ với 18 module Nhóm B đã có schema/API đầy đủ ở Mục 4–5. Khi vấn đáp, nếu giám khảo hỏi về một module cụ thể trong nhóm này, trả lời rõ đây là phần nhóm tự thiết kế thêm để đủ khối lượng 50 module của đề, không phải nghiệp vụ đề gốc bắt buộc — trình bày được vì sao chọn module đó (tái sử dụng entity nào, mức ưu tiên, lý do ưu tiên) là đủ.
7.1 Nguyên tắc thiết kế 32 module Nhóm C
    • Không trùng lặp nghiệp vụ với 18 module Nhóm B đã có (ví dụ không tạo lại "quản lý đơn hàng" vì đã có OrderRequest/GetOrdersFilteredQuery).
    • Ưu tiên các module có thể tái sử dụng entity đã có ở Mục 4 (gắn thêm field hoặc bảng phụ) thay vì luôn phải sinh entity hoàn toàn mới — giảm rủi ro nếu nhóm quyết định nâng một số module Nhóm C lên code thật khi còn dư thời gian.
    • Mỗi module gắn 1 trong 3 mức ưu tiên chỉ áp dụng nếu nhóm còn dư thời gian sau khi đã hoàn thành và kiểm chứng xong toàn bộ 18 module Nhóm B (bao gồm cả test và docker compose up chạy sạch — xem Mục 14). Không bắt đầu module Nhóm C song song lúc Nhóm B chưa xong, kể cả module được đánh "Cao":
        ◦ Cao = nghiệp vụ lõi của một website bán Cloud thật, ưu tiên làm trước trong số Nhóm C nếu có dư buổi.
        ◦ Trung bình = hỗ trợ trải nghiệm, có thể làm sau.
        ◦ Thấp = mang tính "cho đủ", phù hợp nêu ở "hướng phát triển" hơn là code.
7.2 Nhóm C1 — Hạ tầng & dịch vụ kỹ thuật (8 module)
STT
Module
Entity liên quan
Chức năng chính
Endpoint gợi ý
Ưu tiên
19
Đăng ký tên miền (Domain)
Domain (mới): Id, UserId, Name (unique), OrderRequestId, ExpiryDate, AutoRenew, Status
Khách đăng ký/tra cứu tên miền kèm gói hosting
GET /api/domains/check, POST /api/domains, GET /api/domains/me
Trung bình
20
Quản lý DNS Record
DnsRecord (mới): Id, DomainId, Type (A/CNAME/MX...), Name, Value, TTL
Khách tự cấu hình bản ghi DNS cho domain đã mua
GET /api/domains/{id}/dns, POST /api/domains/{id}/dns, DELETE /api/domains/{id}/dns/{recordId}
Thấp
21
Chứng chỉ SSL
SslCertificate (mới): Id, DomainId, IssuedAt, ExpiryDate, Status
Cấp/gia hạn/theo dõi hạn SSL cho domain
POST /api/domains/{id}/ssl, GET /api/domains/{id}/ssl/status
Thấp
22
Sao lưu dữ liệu (Backup)
BackupJob (mới): Id, OrderRequestId, ScheduledAt, Status, SizeMb
Lập lịch/xem lịch sử backup cho gói hosting đang dùng
POST /api/orders/{id}/backups, GET /api/orders/{id}/backups
Trung bình
23
Giám sát uptime & tình trạng dịch vụ
ServiceStatusLog (mới): Id, ServicePlanId hoặc OrderRequestId, CheckedAt, IsUp, ResponseTimeMs
Trang trạng thái dịch vụ thời gian thực (uptime %)
GET /api/status, GET /api/orders/{id}/uptime
Trung bình
24
Truy cập Control Panel
Tái dùng OrderRequest + trường ControlPanelUrl/ControlPanelToken
Sinh link đăng nhập nhanh vào control panel của gói đang dùng
POST /api/orders/{id}/control-panel/access-token
Thấp
25
Quản lý API Key cho khách hàng
ApiKey (mới): Id, UserId, KeyHash, Scopes, CreatedAt, RevokedAt
Khách tự sinh API key để tích hợp hệ thống ngoài
GET /api/api-keys/me, POST /api/api-keys, DELETE /api/api-keys/{id}
Thấp
26
Yêu cầu di chuyển dữ liệu (Migration Request)
MigrationRequest (mới): Id, UserId, FromProvider, OrderRequestId, Status, Note
Khách gửi yêu cầu hỗ trợ chuyển dữ liệu từ nhà cung cấp khác sang
POST /api/migration-requests, GET /api/migration-requests/me, PATCH /api/migration-requests/{id}/status (Admin)
Trung bình
7.3 Nhóm C2 — Thanh toán & tài chính mở rộng (6 module)
STT
Module
Entity liên quan
Chức năng chính
Endpoint gợi ý
Ưu tiên
27
Ví tín dụng nội bộ (Wallet)
Wallet (mới): Id, UserId (unique), Balance; WalletTransaction: Id, WalletId, Amount, Type (Nạp/Trừ), RefOrderId
Khách nạp tiền vào ví, dùng ví để thanh toán đơn hàng thay/kèm cổng thanh toán ngoài
GET /api/wallet/me, POST /api/wallet/topup, GET /api/wallet/transactions
Cao
28
Tự động gia hạn thuê bao
Tái dùng OrderRequest + trường AutoRenew (bit), thêm RenewalJob (mới): Id, OrderRequestId, NextRunAt, Status
Tự tạo Payment mới khi gói sắp hết hạn nếu bật auto-renew
PATCH /api/orders/{id}/auto-renew, GET /api/orders/renewals-due (job nội bộ)
Cao
29
Yêu cầu huỷ/hoàn tiền
RefundRequest (mới): Id, OrderRequestId, Reason, Status (Pending/Approved/Rejected), RefundAmount
Khách gửi yêu cầu huỷ dịch vụ + hoàn tiền, Admin duyệt
POST /api/orders/{id}/refund-requests, GET /api/refund-requests (Admin), PATCH /api/refund-requests/{id}/approve
Cao
30
Xuất hoá đơn (Invoice)
Tái dùng OrderRequest/Payment, thêm Invoice (mới): Id, OrderRequestId, InvoiceNumber (unique), IssuedAt, PdfUrl
Sinh hoá đơn PDF cho mỗi đơn đã thanh toán thành công
GET /api/orders/{id}/invoice
Trung bình
31
Đa tiền tệ (Multi-currency)
Tái dùng PlanPrice + thêm trường Currency, bảng ExchangeRate (mới): Id, FromCurrency, ToCurrency, Rate, UpdatedAt
Hiển thị giá theo tiền tệ người dùng chọn
GET /api/service-plans?currency=USD
Thấp
32
Lưu phương thức thanh toán
SavedPaymentMethod (mới): Id, UserId, Gateway, MaskedInfo, IsDefault
Khách lưu lại phương thức thanh toán đã dùng để tái sử dụng lần sau (chỉ lưu thông tin đã che, không lưu số thẻ thật)
GET /api/payment-methods/me, POST /api/payment-methods, DELETE /api/payment-methods/{id}
Trung bình
⚠️ Lỗi schema cần tránh nếu code module 31: PlanPrice ở Mục 4.1 đang có index (ServicePlanId, BillingCycle) với ngầm định mỗi cặp giá trị này chỉ có đúng 1 mức giá. Nếu thêm Currency mà không sửa lại thành (ServicePlanId, BillingCycle, Currency), hai dòng giá cùng gói/cùng chu kỳ nhưng khác tiền tệ sẽ đụng độ logic truy vấn (Query ở Mục 2.4 hiện đang lấy giá theo đúng 2 điều kiện cũ). Đây là module duy nhất trong Nhóm C bắt buộc phải sửa lại một ràng buộc đã có ở Nhóm B, nên nếu chọn code module này, cần làm ở buổi riêng, không chèn giữa chừng lúc đang ổn định schema Nhóm B.
7.4 Nhóm C3 — Marketing & giữ chân khách hàng (8 module)
STT
Module
Entity liên quan
Chức năng chính
Endpoint gợi ý
Ưu tiên
33
Giới thiệu bạn bè (Referral)
ReferralCode (mới): Id, UserId (unique), Code; ReferralReward: Id, ReferrerUserId, ReferredUserId, RewardAmount, Status
Khách mời bạn dùng mã giới thiệu, cả 2 bên nhận thưởng khi bạn được mời thanh toán đơn đầu tiên
GET /api/referrals/me, POST /api/referrals/apply
Trung bình
34
Danh sách yêu thích (Wishlist)
WishlistItem (mới): Id, UserId, ServicePlanId
Khách lưu gói dịch vụ quan tâm để xem lại sau
GET /api/wishlist/me, POST /api/wishlist, DELETE /api/wishlist/{id}
Thấp
35
Điểm thưởng khách hàng (Loyalty Points)
LoyaltyPoint (mới): Id, UserId (unique), Points; LoyaltyTransaction: Id, UserId, Points, Reason, RefOrderId
Cộng điểm khi thanh toán đơn hàng, dùng điểm đổi giảm giá
GET /api/loyalty/me, POST /api/loyalty/redeem
Trung bình
36
Thẻ quà tặng / Voucher
GiftCard (mới): Id, Code (unique), Amount, RemainingAmount, ExpiryDate, IsActive
Khác với Coupon (giảm % có điều kiện) — GiftCard là mệnh giá cố định dùng trừ dần vào nhiều đơn
POST /api/gift-cards/redeem, GET /api/gift-cards/{code}/balance
Thấp
37
Đăng ký nhận bản tin (Newsletter)
NewsletterSubscriber (mới): Id, Email (unique), SubscribedAt, IsActive
Thu thập email marketing từ khách vãng lai lẫn khách đã đăng ký
POST /api/newsletter/subscribe, DELETE /api/newsletter/unsubscribe
Thấp
38
Nhắc giỏ hàng bị bỏ quên
Tái dùng Cart/CartItem, thêm job nội bộ đọc Cart.Status = Active quá X giờ chưa checkout
Gửi email nhắc khách hoàn tất đơn hàng đang dang dở
Không có endpoint public — chạy dạng background job đọc GetAbandonedCartsQuery
Thấp
39
Đánh giá nổi bật (Testimonials)
Tái dùng Review + thêm trường IsFeatured (bit)
Admin chọn review tốt để hiển thị nổi bật ở trang chủ
PATCH /api/reviews/{id}/feature, GET /api/testimonials
Thấp
40
Banner/Slider trang chủ
Banner (mới): Id, ImageUrl, LinkUrl, DisplayOrder, IsActive, StartDate, EndDate
Admin quản lý banner quảng cáo hiển thị trang chủ
GET /api/banners, POST /api/banners (Admin), PUT /api/banners/{id} (Admin)
Thấp
Phân biệt module 33 (Referral) với AffiliateApplication (Nhóm B, Mục 4.1): hai module dễ bị nhầm là một vì cùng "thưởng cho người giới thiệu khách mới", nhưng khác bản chất — Affiliate là quan hệ đối tác kinh doanh dài hạn, phải nộp đơn và được Admin duyệt trước khi có hiệu lực, hoa hồng tính theo % liên tục; Referral là cơ chế tự động giữa 2 khách hàng thường, không cần duyệt, chỉ thưởng 1 lần cho đơn đầu tiên. Nếu bị hỏi "sao có 2 module giống nhau", đây là câu trả lời phân biệt.
7.5 Nhóm C4 — Nội dung & hỗ trợ mở rộng (6 module)
STT
Module
Entity liên quan
Chức năng chính
Endpoint gợi ý
Ưu tiên
41
Câu hỏi thường gặp (FAQ)
FaqItem (mới): Id, Question, Answer, CategoryTag, DisplayOrder
Trang FAQ tĩnh, Admin quản lý nội dung
GET /api/faqs, POST /api/faqs (Admin)
Trung bình
42
Trung tâm tài liệu (Knowledge Base)
KbArticle (mới): Id, Title, Slug (unique), Content, CategoryTag
Tài liệu hướng dẫn kỹ thuật sâu hơn tin tức thông thường, tách riêng khỏi NewsArticle vì mục đích khác (tra cứu, không phải tin tức)
GET /api/kb-articles, GET /api/kb-articles/{slug}
Thấp
43
Bình luận bài viết (Blog Comments)
ArticleComment (mới): Id, NewsArticleId, UserId, Content, IsApproved, CreatedAt
Khách bình luận dưới bài tin tức, cùng cơ chế duyệt như Review
POST /api/news/{id}/comments, PATCH /api/comments/{id}/approve (Admin)
Thấp
44
Live Chat hỗ trợ trực tuyến
ChatSession (mới): Id, UserId, StaffId (nullable), Status; ChatMessage: Id, SessionId, SenderId, Content, SentAt
Kênh hỗ trợ tức thời, khác SupportTicket ở chỗ đồng bộ thời gian thực (cần WebSocket/SignalR) chứ không phải hội thoại bất đồng bộ
POST /api/chat/sessions, POST /api/chat/sessions/{id}/messages (kèm kênh realtime)
Trung bình
45
Tìm kiếm toàn hệ thống (Global Search)
Không cần entity mới — Query tổng hợp trên ServicePlan, NewsArticle, FaqItem, KbArticle
Một ô tìm kiếm trả kết quả gộp từ nhiều loại nội dung
GET /api/search?q=
Trung bình
46
Lịch sử xem gần đây (Recently Viewed)
RecentlyViewed (mới): Id, UserId, ServicePlanId, ViewedAt
Gợi ý lại gói dịch vụ khách vừa xem, tăng tỉ lệ quay lại mua
GET /api/recently-viewed/me
Thấp
7.6 Nhóm C5 — Quản trị hệ thống nâng cao (4 module)
STT
Module
Entity liên quan
Chức năng chính
Endpoint gợi ý
Ưu tiên
47
Phân quyền chi tiết (Permission theo hành động)
Permission (mới): Id, Code (vd orders.approve); RolePermission: RoleId, PermissionId
Nâng cấp từ phân quyền theo Role thô (Admin/Editor/Customer) sang phân quyền theo từng hành động cụ thể, cho hệ thống lớn hơn về sau
GET /api/permissions, PUT /api/roles/{id}/permissions
Thấp
48
Cấu hình hệ thống (System Settings)
SystemSetting (mới): Id, Key (unique), Value, UpdatedAt
Admin chỉnh các tham số vận hành (email gửi từ, số lần thử đăng nhập tối đa...) mà không cần sửa code/deploy lại
GET /api/settings, PUT /api/settings/{key} (Admin)
Thấp
49
Xuất báo cáo (Export Excel/PDF)
Không cần entity mới — chỉ là biến thể xuất file của các Query đã có (GetRevenueStatsQuery, GetOrdersFilteredQuery...)
Admin xuất báo cáo doanh thu/đơn hàng ra file thay vì chỉ xem trên dashboard
GET /api/dashboard/revenue-stats/export?format=xlsx
Trung bình
50
SEO & Sitemap
Tái dùng NewsArticle/ServicePlan + thêm trường MetaTitle/MetaDescription, sinh sitemap.xml động
Tối ưu công cụ tìm kiếm cho các trang công khai
GET /sitemap.xml, cập nhật meta khi tạo/sửa NewsArticle/ServicePlan
Thấp
7.7 Tác động lên Mục 4 (Domain Model) nếu nâng module Nhóm C lên code thật
Nếu nhóm quyết định code thêm một vài module ưu tiên Cao ở trên (Wallet, Auto-renew, Refund Request), cần lưu ý:
    • Wallet/WalletTransaction nên tách bảng riêng khỏi AppUser (không nhét thẳng số dư vào AppUser) để giữ lịch sử giao dịch đầy đủ và dễ đối soát.
    • RefundRequest nên tham chiếu OrderRequest, không tham chiếu Payment trực tiếp — vì một đơn hàng có thể có nhiều Payment do thử lại (xem ghi chú Mục 4.0), refund luôn tính theo đơn hàng chứ không theo một lần thanh toán cụ thể.
    • RenewalJob (auto-renew) nên chạy như một tiến trình nền (background job/scheduled task) riêng biệt, không gọi trực tiếp từ HTTP request — tương tự cách ConfirmPaymentWebhookCommandHandler phát sự kiện rồi để tiến trình khác xử lý, giữ đúng tinh thần tách nghiệp vụ đồng bộ/bất đồng bộ đã dùng ở Mục 2.4.
7.8 Tổng hợp entity mới do Nhóm C đề xuất (tra cứu nhanh khi vẽ lại ERD)
30 entity mới nếu code hết toàn bộ Nhóm C (không tính các module chỉ tái dùng entity sẵn có — Control Panel, Nhắc giỏ hàng, Testimonials, Global Search, Export báo cáo, SEO không sinh entity mới nào): Domain, DnsRecord, SslCertificate, BackupJob, ServiceStatusLog, ApiKey, MigrationRequest (7, nhóm C1); Wallet, WalletTransaction, RefundRequest, Invoice, ExchangeRate, SavedPaymentMethod (6, nhóm C2); ReferralCode, ReferralReward, WishlistItem, LoyaltyPoint, LoyaltyTransaction, GiftCard, NewsletterSubscriber, Banner (8, nhóm C3); FaqItem, KbArticle, ArticleComment, ChatSession, ChatMessage, RecentlyViewed (6, nhóm C4); Permission, RolePermission, SystemSetting (3, nhóm C5). Trong thực tế nhóm sẽ chỉ chọn code một phần nhỏ (nếu có) trong số này — danh sách này chỉ để không bị sót khi liệt kê "hướng phát triển" trong báo cáo.
8. LUỒNG NGHIỆP VỤ CHÍNH — mô tả tuần tự (thay cho sequence diagram)
    8. Khách thêm gói dịch vụ vào giỏ hàng — hệ thống trả về giỏ hàng đã cập nhật.
    9. Khách bấm checkout — hệ thống tạo OrderRequest mới với trạng thái "New", snapshot giá và mức giảm giá (nếu có áp coupon) ngay tại thời điểm này, đồng thời đánh dấu giỏ hàng đã checkout.
    10. Hệ thống tạo Payment gắn với IdempotencyKey duy nhất, trả về link chuyển hướng sang cổng thanh toán.
    11. Khách thanh toán trên cổng thanh toán thật (VNPay/Momo).
    12. Cổng thanh toán gọi webhook về hệ thống. Hệ thống xác minh chữ ký, kiểm tra IdempotencyKey đã xử lý chưa, nếu chưa thì cập nhật Payment sang trạng thái "Confirmed" và phát sự kiện "thanh toán thành công".
    13. Sự kiện này kích hoạt gửi email xác nhận đơn hàng cho khách (minh hoạ cho Observer Pattern — hành động phụ tách rời khỏi luồng chính).
*(Khi làm báo cáo, nên vẽ lại luồng này thành sequence diagram bằng công cụ vẽ sơ đồ để minh hoạ trực quan.)*
9. CHIẾN LƯỢC TESTING (map 10đ) — không code, chỉ định hướng
Nguyên tắc chung: mỗi Command/Query quan trọng cần ít nhất 1 test xác nhận hành vi đúng (happy path) và các Validator cần test riêng cho trường hợp dữ liệu sai.
Vì sao phân bổ nghiêng về Command Handler (6/15) thay vì chia đều 4 nhóm? Vì rủi ro nghiệp vụ tập trung ở nhánh ghi: một Command sai có thể tạo dữ liệu sai vĩnh viễn trong DB (đơn hàng trùng, coupon bị dùng vượt giới hạn, thanh toán bị xác nhận 2 lần), trong khi một Query sai chỉ hiển thị sai chứ không phá dữ liệu — hậu quả không đối xứng nên mức độ kiểm thử cũng không nên chia đều. Đây là câu trả lời hợp lý nếu bị hỏi "sao không test đều các nhóm cho công bằng".
Phân bổ 15 test tối thiểu:
Nhóm
Số test
Nội dung cần kiểm tra
Command Handlers
6
Tạo đơn hàng thành công và phát sự kiện tương ứng; thêm vào giỏ hàng; tạo review; tạo ticket; áp mã giảm giá; xử lý webhook thanh toán đảm bảo tính idempotent (gọi 2 lần với cùng key chỉ xử lý 1 lần — quan trọng nhất trong nhóm này)
Query Handlers
4
Danh sách gói dịch vụ phân trang đúng; so sánh nhiều gói; lọc đơn hàng theo điều kiện; thống kê doanh thu
Validators
3
Dữ liệu tạo đơn hàng sai bị từ chối; số lượng thêm giỏ hàng vượt giới hạn bị từ chối; đánh giá thiếu trường bắt buộc bị từ chối
Domain Events
2
Sự kiện tạo đơn được phát đúng thời điểm; sự kiện thanh toán thành công kích hoạt gửi email
Điểm cần nhấn khi vấn đáp: test xử lý webhook thanh toán trùng lặp là bằng chứng rõ nhất cho việc nhóm hiểu và xử lý đúng vấn đề idempotency trong hệ thống thanh toán thực tế — nên ưu tiên trình bày kỹ test này.
10. CHIẾN LƯỢC CI/CD (map phần trong 10đ Git+CI/CD+Docker)
Pipeline chạy tự động khi có push hoặc pull request vào nhánh chính/nhánh phát triển, gồm các bước: dựng môi trường .NET, khởi tạo một instance SQL Server tạm để chạy test tích hợp, khôi phục gói phụ thuộc, build ở cấu hình Release, chạy toàn bộ unit test kèm thu thập độ phủ code (coverage), và lưu lại báo cáo coverage như một artifact của lần chạy để tham khảo hoặc đính kèm báo cáo.
11. CHIẾN LƯỢC DOCKER & DEPLOYMENT (map phần còn lại của 10đ, +5đ deploy)
11.1 Nguyên tắc build
Dùng multi-stage build: giai đoạn đầu dùng SDK đầy đủ để restore và publish ứng dụng, giai đoạn cuối chỉ dùng runtime nhẹ để chạy — giúp image cuối cùng nhỏ gọn hơn nhiều so với đóng gói luôn SDK.
11.2 Vấn đề thường gặp khi chạy docker compose — và cách phòng tránh
Cấu hình "chờ container database khởi động xong rồi mới chạy container API" theo kiểu khai báo cũ chỉ đợi container bật lên, chứ không đợi SQL Server bên trong đã sẵn sàng nhận kết nối — SQL Server cần khoảng 10–30 giây để khởi tạo sau khi container báo "đã chạy". Trên máy dev đã từng chạy container này trước đó (dữ liệu đã khởi tạo sẵn) sẽ không thấy lỗi, nhưng trên máy sạch, container API sẽ bị crash ngay lần chạy đầu vì kết nối vào database chưa kịp mở.
Cách khắc phục gồm 2 lớp phòng vệ:
    14. Thiết lập kiểm tra sức khoẻ (healthcheck) cho container database, và cấu hình container API chỉ khởi động sau khi healthcheck báo "khoẻ" — không chỉ đợi container "đã lên".
    15. Song song đó, cấu hình tầng kết nối database ở phía ứng dụng tự động thử lại kết nối vài lần nếu thất bại — phòng trường hợp healthcheck báo khoẻ nhưng SQL Server vẫn chưa nhận hết được connection.
Mật khẩu database và secret của JWT nên đặt trong file cấu hình môi trường riêng, không commit lên Git, chỉ nộp kèm một bản mẫu không chứa giá trị thật.
⚠️ Đề trừ −10 điểm nếu lỗi khi chạy trên máy sạch — bắt buộc phải test docker compose up trên máy chưa cài sẵn .NET/SQL Server trước khi nộp, vì máy dev thường có sẵn dependency che giấu lỗi cấu hình.
12. CHIẾN LƯỢC INDEXING DATABASE
Bảng
Index đề xuất
Lý do
ServicePlan
(CategoryId, IsActive)
Lọc danh sách theo danh mục
PlanPrice
(ServicePlanId, BillingCycle)
Join lấy giá theo chu kỳ
OrderRequest
(UserId, Status), (CreatedAt), (CouponId)
Dashboard cá nhân + thống kê theo tháng + tra hiệu quả coupon
Payment
Unique (IdempotencyKey), (TransactionRef)
Chống xử lý webhook trùng
Coupon
Unique (Code)
Tra cứu mã giảm giá tức thời
Review
(ServicePlanId, IsApproved)
Trang chi tiết gói chỉ hiện review đã duyệt
LoginHistory
(UserId, LoginAt giảm dần)
Truy vấn lịch sử đăng nhập gần nhất nhanh
NewsArticle
Unique (Slug), (Status, CreatedAt giảm dần)
Trang chi tiết theo slug + danh sách bài mới nhất
AuditLog
(EntityName, EntityId), (Timestamp giảm dần)
Tra lịch sử thay đổi 1 bản ghi cụ thể
13. LỘ TRÌNH 12 BUỔI
Buổi
Công việc
2–3
Thống nhất SOLID, chốt kiến trúc CQRS + Mediator, phân công theo Feature
4
Dựng Clean Architecture, cài đặt các thư viện nền tảng, viết middleware xử lý lỗi tập trung
5
Migration 20 entity (Mục 4), thiết lập song song EF Core (Command) + Dapper (Query)
6
Hoàn thiện 65 endpoint (Mục 5), tài liệu API, kiểm tra chuẩn ProblemDetails
7
JWT, refresh rotation, rate limiting, QR, lịch sử đăng nhập
8
Hoàn thành tối thiểu 15 test theo Mục 9
9
Đảm bảo ≥10 Pull Request, mỗi người phụ trách trọn 1 Feature; bắt đầu viết phần "hướng phát triển" trong báo cáo dựa trên Mục 7 (32 module Nhóm C) — chỉ viết đặc tả, không code trừ khi đã dư thời gian sau buổi 10
10
CI/CD (Mục 10), Docker (Mục 11) — test trên máy sạch
11
Deploy thật lên hạ tầng cloud, thiết lập logging tập trung
12
Demo toàn luồng: Giỏ hàng → Coupon → Thanh toán (webhook idempotent) → QR → Dashboard
14. RỦI RO CẦN TRÁNH
    • Không áp dụng cache cho các Query có dữ liệu thay đổi liên tục (ví dụ giỏ hàng của tôi) — chỉ nên cache Query công khai, ít thay đổi (danh sách gói, tin tức).
    • IdempotencyKey của Payment bắt buộc có unique index trong database — thiếu điều này, việc cổng thanh toán gọi lại webhook có thể tạo ra đơn hàng trùng.
    • Refresh token không bao giờ được lưu dạng chữ (plain-text) trong database, chỉ lưu bản băm.
    • Bắt buộc test docker compose up trên máy sạch trước buổi 11 (trừ −10 điểm nếu lỗi) — xem cách phòng tránh cụ thể ở Mục 11.2.
    • 18 module Nhóm B đã đủ khối lượng cho 12 buổi/3–4 người — không nên nhận thêm module giữa chừng. Với 32 module Nhóm C ở Mục 7 (đặc biệt các module gắn nhãn "Cao"), rủi ro lớn nhất không phải là thiếu ý tưởng mà là bị cám dỗ code thêm quá sớm khi Nhóm B chưa ổn định — chỉ cân nhắc module Nhóm C sau khi đã qua được bước kiểm tra docker compose up trên máy sạch và đủ 15 test pass (tức khoảng sau buổi 10).
    • Chỉ nên có 1 thành viên duy nhất trong nhóm được phép tạo migration của database (khuyến nghị là người sở hữu entity AppUser/Role vì đây là entity gốc). Lý do: OrderRequest có khoá ngoại tới cả AppUser và ServicePlan do 2 người khác phụ trách — nếu nhiều thành viên tự tạo migration song song trên nhánh riêng, file migration sẽ gần như chắc chắn bị xung đột khi merge và rất khó xử lý bằng tay. Quy trình đúng: các thành viên khác chỉ code Entity + cấu hình, đẩy Pull Request vào nhánh chung; người giữ quyền migration chỉ tạo migration sau khi đã merge xong.
    • Việc tăng số lượt đã dùng của mã giảm giá phải nằm trong cùng một transaction với việc tạo đơn hàng — tách thành 2 bước riêng sẽ gây ra tình trạng đua tranh dữ liệu (race condition) khi nhiều khách hàng áp cùng một mã giảm giá gần hết lượt tại cùng thời điểm.
15. QUYẾT ĐỊNH KIẾN TRÚC CẦN CHỐT TRƯỚC BUỔI 5 (migration)
Ba quyết định này ảnh hưởng trực tiếp tới schema ở Mục 4 — chốt trễ sau khi đã migrate sẽ tốn công sửa lại. Schema hiện tại đã ngầm giả định phương án được đề xuất ở mỗi mục; nếu nhóm chọn phương án khác, cần sửa lại Mục 4 tương ứng.
a) Đặt hàng có bắt buộc đăng nhập (guest checkout) không?
Schema hiện tại quy định trường liên kết người dùng của đơn hàng là bắt buộc (không được để trống), và mọi endpoint giỏ hàng/đặt hàng đều yêu cầu vai trò khách hàng đã đăng nhập. Đề xuất: không hỗ trợ đặt hàng khách vãng lai, bắt đăng nhập trước khi thêm vào giỏ — vì điều này đơn giản hoá đáng kể (không cần lưu email/số điện thoại khách vãng lai, không cần xử lý gộp giỏ hàng khách vãng lai vào tài khoản sau khi đăng nhập) mà vẫn đủ đáp ứng yêu cầu đề. Nếu nhóm muốn cho phép khách vãng lai đặt hàng, cần chuyển trường liên kết người dùng sang có thể để trống và bổ sung thêm trường email/số điện thoại khách vãng lai vào đơn hàng.
b) Khuyến mãi áp dụng cho 1 gói cụ thể hay nhiều gói cùng lúc?
Schema hiện tại chỉ hỗ trợ 2 cấp độ: áp dụng cho 1 gói cụ thể, hoặc để trống nghĩa là áp dụng toàn site — chưa hỗ trợ trường hợp "1 khuyến mãi cho một nhóm gói được chọn tuỳ ý". Với khối lượng 18 module trong 12 buổi, đề xuất giữ nguyên 2 cấp độ này là đủ; việc xây dựng quan hệ nhiều-nhiều giữa khuyến mãi và gói dịch vụ là làm thừa so với thời gian còn lại, chỉ nên làm thêm nếu nhóm đã hoàn thành sớm và còn dư thời gian.
c) Đơn đăng ký affiliate được duyệt có tạo tài khoản mới không?
Schema hiện tại quy định đơn đăng ký affiliate bắt buộc phải liên kết với một tài khoản người dùng đã có sẵn — nghĩa là người dùng phải đăng ký tài khoản khách hàng trước, sau đó mới nộp đơn affiliate. Khi được duyệt, hệ thống không tạo tài khoản mới, chỉ cập nhật thông tin hoa hồng và có thể đổi vai trò của tài khoản đó (ví dụ chuyển sang vai trò Affiliate riêng nếu nhóm muốn tách bạch vai trò này khỏi khách hàng thường). Nếu nhóm chọn phương án cho phép nộp đơn mà không cần có tài khoản trước (chỉ cần nhập email công ty), cần chuyển trường liên kết người dùng sang có thể để trống, bổ sung thêm trường thông tin liên hệ, và khi duyệt đơn hệ thống sẽ phải tự tạo tài khoản mới rồi gửi email hướng dẫn đặt mật khẩu.
16. CÂU HỎI VẤN ĐÁP THƯỜNG GẶP & CÁCH TRẢ LỜI NGẮN GỌN
Tổng hợp các câu hỏi nhiều khả năng bị hỏi nhất dựa trên các điểm "hay bị hỏi" đã đánh dấu rải rác trong tài liệu, gom lại một chỗ để ôn nhanh trước buổi vấn đáp. Mỗi câu trả lời nên nói được trong 30–45 giây, không lan man.
Câu hỏi
Ý chính cần trả lời
Tham chiếu
Vì sao chọn CQRS cho một hệ thống không lớn?
Thừa nhận là lựa chọn có chủ đích để thoả nhiều tiêu chí điểm cùng lúc (pattern, SOLID, chia việc song song), không phải "bắt buộc phải dùng vì hệ thống lớn"
Mục 0.1
CQRS ở đây khác gì so với chỉ tách Controller thành 2 loại Read/Write?
CQRS thật sự nằm ở việc 2 nhánh dùng công nghệ truy cập dữ liệu khác nhau (EF Core vs Dapper) và không bao giờ trộn trách nhiệm — Command không trả dữ liệu tổng hợp phức tạp, Query không ghi
Mục 2.3
Webhook thanh toán được gọi trùng thì xử lý thế nào, tại sao không chỉ dựa vào trạng thái đơn hàng để chặn?
Phải dựa vào IdempotencyKey có unique index, không dựa vào trạng thái vì có race condition khi 2 request webhook đến gần như đồng thời trước khi request đầu kịp cập nhật trạng thái
Mục 2.4, 4.2
Làm sao biết chữ ký webhook là thật, không phải ai đó tự chế request giống hệt?
Chữ ký HMAC được tính từ một secret riêng chỉ hệ thống và cổng thanh toán biết, verify bằng phép so sánh có thời gian cố định để tránh timing attack — không thể giả nếu không biết secret
Mục 6.5
Refresh token bị đánh cắp thì hệ thống phát hiện bằng cách nào?
Nhờ cơ chế rotation: token cũ luôn bị vô hiệu hoá ngay sau 1 lần dùng, nên nếu có 2 bên cùng cố dùng 1 token, bên dùng sau (thường là kẻ tấn công dùng token đã bị rotate) sẽ bị phát hiện và toàn bộ session bị thu hồi
Mục 6.2, 6.7
Tại sao tách EF Core và Dapper mà không dùng 1 công nghệ cho cả 2 nhánh?
EF Core mạnh về ORM/transaction cho nghiệp vụ ghi phức tạp; Dapper mạnh về SQL tối ưu tay cho truy vấn danh sách nhiều điều kiện lọc — dùng đúng công cụ cho đúng việc thay vì ép 1 công nghệ làm mọi thứ
Mục 2.3
Vì sao migration chỉ giao cho 1 người, không phải cả nhóm cùng làm cho nhanh?
Vì các entity có khoá ngoại chéo nhau giữa các thành viên phụ trách (ví dụ OrderRequest tham chiếu cả AppUser và ServicePlan) — nếu nhiều người tạo migration song song trên nhánh riêng, file migration gần như chắc chắn conflict khi merge và khó resolve bằng tay
Mục 14
Test nào là quan trọng nhất trong 15 test tối thiểu?
Test xác nhận webhook thanh toán gọi trùng chỉ được xử lý đúng 1 lần — vì đây là bằng chứng rõ nhất cho việc hiểu đúng vấn đề idempotency trong hệ thống thanh toán thực tế
Mục 9
Coupon có giới hạn lượt dùng, làm sao tránh 2 khách cùng dùng lượt cuối cùng?
Việc tăng UsedCount phải nằm trong cùng transaction với việc tạo OrderRequest, không tách 2 bước riêng — nếu tách riêng sẽ có khoảng hở thời gian giữa kiểm tra và cập nhật gây race condition
Mục 4.2, 14
docker compose up chạy được trên máy nhóm nhưng sao đề vẫn trừ điểm cho nhóm khác?
Vì depends_on kiểu cũ chỉ đợi container bật, không đợi SQL Server bên trong sẵn sàng nhận kết nối — máy đã từng chạy trước đó (có cache/data cũ) sẽ không lộ lỗi, máy sạch mới lộ. Khắc phục bằng healthcheck + retry ở tầng kết nối ứng dụng
Mục 11.2
Hệ thống còn lỗ hổng bảo mật nào chưa xử lý?
Trung thực nêu: XSS ở tầng hiển thị nội dung người dùng nhập (Review/Comment) và WAF/DDoS ở tầng hạ tầng — ngoài phạm vi 10đ bảo mật Backend cơ bản của đề, nhưng nhóm nhận biết được
Mục 6.7
17. CHECKLIST TRƯỚC KHI NỘP
Danh sách kiểm tra nhanh, đối chiếu ngược lại với các mục rủi ro (Mục 14) và các yêu cầu điểm số (Mục 1) để tránh mất điểm oan vì lỗi vặt.
    • Toàn bộ 65 endpoint (Mục 5) đã có Swagger/tài liệu, đã test thử ít nhất 1 lần bằng Postman hoặc tương đương.
    • Toàn bộ response lỗi trả đúng định dạng ProblemDetails, không có endpoint nào lọt lỗi 500 kèm stack trace thô ra ngoài.
    • IdempotencyKey của Payment và Code của Coupon đã có unique index thật trong database, không chỉ kiểm tra ở tầng code.
    • Refresh token trong database chỉ ở dạng hash, đã thử log/inspect DB để tự xác nhận không có token thô nào bị lưu nhầm.
    • Đã chạy docker compose up trên một máy hoàn toàn sạch (không có sẵn .NET/SQL Server) và xác nhận hệ thống lên được, không cần can thiệp tay.
    • File .env chứa mật khẩu/secret thật đã nằm trong .gitignore, chỉ có .env.example không chứa giá trị thật được commit.
    • Đã có ≥15 test chạy pass, đã thử chạy dotnet test trên máy sạch (không chỉ trên máy đã cấu hình sẵn).
    • Lịch sử Git có ≥10 Pull Request, mỗi Feature có thể truy vết về đúng 1 thành viên phụ trách.
    • Mỗi thành viên tự tổng hợp lại phần Feature mình phụ trách theo đúng cấu trúc Command/Query/Test để sẵn sàng trả lời vấn đáp riêng phần đó (đối chiếu Mục 16).
    • ERD và sequence diagram (Mục 4.0, Mục 8) đã được vẽ lại bằng công cụ trực quan và chèn vào báo cáo PDF, không chỉ để dạng mô tả chữ.
    • Đã deploy thật lên hạ tầng cloud (không chỉ chạy local) nếu muốn lấy +5đ deploy, và đã tự truy cập thử bằng một trình duyệt khác/máy khác để xác nhận hoạt động.
GHI CHÚ SỬ DỤNG
Bản này phù hợp để trích trực tiếp vào phần thuyết minh của báo cáo PDF (đặc biệt các Mục 0.1, 2, 3, 6, 9, 14, 15, 16 — nơi hay bị hỏi vấn đáp vì đòi hỏi hiểu bản chất chứ không chỉ chép code). Code mẫu minh hoạ (Command/Query/Handler, middleware, cấu hình bảo mật, YAML CI, Dockerfile, docker-compose) nên để riêng trong repo hoặc phụ lục báo cáo, dẫn chiếu tới đúng mục tương ứng ở đây khi trình bày.
Trước buổi vấn đáp, ưu tiên đọc lại Mục 16 (Q&A) và Mục 17 (checklist) — đây là hai mục được tổng hợp riêng để ôn nhanh trong ngày cuối, không cần đọc lại toàn bộ tài liệu.
