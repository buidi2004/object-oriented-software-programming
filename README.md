IN4211– Phát triển phần mềm hướng đối tượng
Bài tập lớn cuối kỳ
TRƯỜNG ĐẠI HỌC ĐỒNG THÁP
KHOA CÔNG NGHỆ VÀ KỸ THUẬT
BỘ MÔN KHOA HỌC MÁY TÍNH
ĐỀ BÀI TẬP LỚN CUỐI KỲ
Website Bán Dịch vụ Cloud (VPS, Hosting, Domain...)
Học phần: Phát triển phần mềm hướng đối tượng (IN4211)
Hình thức đánh giá HĐ9.5– Báo cáo cuối môn, trọng số 0.5
Chuẩn đầu ra
5.1, 5.2, 5.3
Hình thức làm bài Nhóm 3–4 sinh viên (giữ nguyên nhóm chủ đề)
Thời hạn
Báo cáo và demo tại Buổi 12
1. Bối cảnh đề bài
Một doanh nghiệp cung cấp dịch vụ cloud (tương tự https://vietnix.vn/) cần xây
dựng website chính thức để:
Giới thiệu doanh nghiệp, hạ tầng datacenter và các dịch vụ: VPS, Hosting, Domain,
Email doanh nghiệp, SSL, Firewall chống DDoS...;
Công bố bảng giá các gói dịch vụ theo chu kỳ thanh toán (tháng/năm) và chương
trình khuyến mãi;
Tiếp nhận yêu cầu đăng ký dịch vụ / tư vấn từ khách hàng cá nhân và doanh nghiệp;
Đăng tin tức, blog kiến thức (hướng dẫn kỹ thuật, khuyến mãi, thông báo bảo trì...).
Nhóm sinh viên đóng vai trò đội phát triển, xây dựng hệ thống gồm Backend Web API
(.NET) và Frontend (Next.js hoặc Blazor).
2. Kiến trúc và công nghệ bắt buộc
2.1. Backend– ASP.NET Core Web API (.NET 8/9)
Tổchức solution theo Clean Architecture 4 tầng: Domain, Application, Infrastructure,
WebApi (buổi 4);
Áp dụng SOLID principles và tối thiểu 3 Design Patterns (Repository, Unit of Work,
Factory/Singleton/Observer...)– chỉ rõ trong báo cáo áp dụng ở đâu (buổi 2, 3);
ORM:Entity Framework Core hoặc Dapper (hoặc hybrid– khuyến khích, buổi 5), CSDL
SQL Server;
RESTAPIđúngchuẩn:danhtừsốnhiều,statuscodehợplý,pagination/filtering/sorting,
ProblemDetails cho lỗi, Swagger/OpenAPI (buổi 6);
Bảo mật (buổi 7):
1
IN4211– Phát triển phần mềm hướng đối tượng
Bài tập lớn cuối kỳ– JWTauthentication + refresh token cho khu vực quản trị;– Phân quyền theo role: Admin, Editor (tối thiểu 2 role);– Password hash bằng Bcrypt/PBKDF2;– Sinh mã QR cho mỗi gói dịch vụ (quét ra trang chi tiết gói / trang đặt hàng).
2.2. Frontend– chọn MỘT trong hai
Lựa
chọn
Công nghệ
Ghi chú
Option A Next.js
(React,
App Router)
Option B Blazor
bAssembly
Server)
(We
hoặc
Gọi API bằng fetch/axios, SSR/SSG cho landing page
Gọi API bằng HttpClient
Yêu cầu chung: responsive (desktop + mobile), có trang quản trị đăng nhập bằng JWT.
2.3. Quy trình phát triển
Git/GitHub (buổi 9): làm việc trên feature branch, merge qua Pull Request có re
view, tối thiểu 10 PR và commit đều của tất cả thành viên;
Unit Testing (buổi 8): xUnit + Moq, tối thiểu 15 test cases cho Domain/Application,
báo cáo coverage;
CI/CD (buổi 10): GitHub Actions tự động build + test khi push/PR; có Dockerfile
cho API và docker-compose.yml (API + SQL Server);
Triển khai (buổi 11, khuyến khích– điểm cộng): deploy lên Azure/AWS hoặc VPS, có
logging bằng Serilog.
3. Yêu cầu chức năng
2
IN4211– Phát triển phần mềm hướng đối tượng
Bài tập lớn cuối kỳ
3.1. Trang công khai (Landing Page)
# Chứcnăng
Mô tả
1
2
3
4
5
6
7
8
Trang chủ
Giới thiệu
Dịch vụ
Bảng giá
Khách hàng
Tin tức / Blog
Liên hệ / Đặtdịch
vụ
Hero banner, gói dịch vụ nổi bật, khuyến mãi đang chạy, cam kết
uptime, tin mới nhất
Lịch sử, hạ tầng datacenter, chứng chỉ (ISO...), cam kết
SLA/uptime 99.9%
Danh mục: VPS (nhiều cấu hình), Hosting, Domain, Email doanh
nghiệp, SSL, Firewall chống DDoS... kèm mô tả, thông số kỹ
thuật
So sánh các gói theo cấu hình (CPU/RAM/SSD/băng thông), giá
theo chu kỳ tháng/năm, khuyến mãi có thời hạn, nút đặt hàng
từng gói
Đánh giá/testimonial, logo khách hàng tiêu biểu, mã QR từng gói
dịch vụ
Danh sách + chi tiết bài viết, phân trang, tìm kiếm, phân loại
(hướng dẫn, khuyến mãi...)
Form đăng ký: chọn dịch vụ, gói/cấu hình, chu kỳ thanh toán,
thông tin khách hàng; lưu vào DB
Đối tác / Affiliate Trang thông tin chính sách hoa hồng + form đăng ký làm đối
tác/affiliate
3.2. Trang quản trị (yêu cầu đăng nhập JWT)
# Chứcnăng
Role
1
2
3
4
5
6
7
8
Đăng nhập, refresh token, đổi mật khẩu
CRUD gói dịch vụ + bảng giá/khuyến mãi (tự động cập nhật giá
ngoài trang chủ)
CRUD danh mục dịch vụ, gói cấu hình (kèm sinh lại mã QR)
CRUD tin tức/blog (soạn thảo rich text hoặc markdown)
Quản lý yêu cầu đặt dịch vụ / đăng ký affiliate: xem, đổi trạng thái
(Mới → Đang xử lý → Hoàn tất/Từ chối)
Tất cả
Admin
Admin
Admin, Editor
Admin, Editor
Thống kê: số yêu cầu theo tháng, gói dịch vụ được quan tâm– biểu đồ Admin
Xuất danh sách yêu cầu đặt dịch vụ ra Excel (EPPlus/ClosedXML) Admin
Audit log: ghi lại ai đăng nhập, ai sửa giá, khi nào
Admin
3.3. Gợi ý mô hình dữ liệu (tối thiểu)
ServiceCategory (VPS/Hosting/Domain...), ServicePlan (gói dịch vụ), PlanPrice (giá
theo chu kỳ tháng/năm), Promotion (khuyến mãi), NewsArticle, OrderRequest (yêu cầu
đặt dịch vụ), AffiliateApplication, AppUser, Role, AuditLog.
Nhóm được tự mở rộng mô hình, nhưng phải có sơ đồ ERD trong báo cáo.
3
IN4211– Phát triển phần mềm hướng đối tượng
Bài tập lớn cuối kỳ
4. Sản phẩm nộp
1. Source code trên GitHub repository của nhóm (mời GV vào repo):
README: mô tả kiến trúc, hướng dẫn chạy (docker compose up phải chạy được),
tài khoản demo;
Lịch sử commit/PR thể hiện đóng góp từng thành viên.
2. Báo cáo (PDF, 15–25 trang): phân tích yêu cầu, ERD, sơ đồ kiến trúc Clean Architec
ture, các Design Pattern đã áp dụng (kèm trích code), ảnh chụp màn hình, phân công
công việc, kết quả test coverage.
3. Slides + Demo trực tiếp tại buổi 12 (15 phút/nhóm + 5 phút hỏi đáp): demo end-to
end cả trang công khai và trang quản trị, demo pipeline CI chạy trên GitHub Actions.
5. Thang điểm (100 điểm → quy về trọng số 0.5)
Tiêu chí
Điểm
Kiến trúc Clean Architecture + SOLID + Design Patterns đúng và có giải thích 20
Backend API: đầy đủ chức năng, đúng chuẩn REST, ORM hợp lý
20
Frontend: đầy đủ chức năng, responsive, trải nghiệm tốt
Bảo mật: JWT + role, hash password, QR code
Unit Testing (≥15 tests, có coverage)
Git teamwork (PR, review, đóng góp đều) + CI/CD + Docker
Báo cáo + thuyết trình, demo trôi chảy
Trả lời vấn đáp (hỏi từng thành viên về phần mình làm)
15
10
10
10
10
5
Điểm cộng: deploy thực tế lên cloud có link chạy được
+5
5.1. Quy định trừ điểm
docker compose up không chạy được:–10;
Thành viên không có commit/PR đáng kể: thành viên đó bị trừ tới 50% điểm cá nhân;
Sao chép code nhóm khác hoặc dự án có sẵn không khai báo nguồn: 0 điểm toàn nhóm
(theo quy định học phần);
Nộp trễ:–10%/ngày.
Mọi thắc mắc về đề bài liên hệ giảng viên qua email hoặc kênh lớp học.
Đề bài có thể được điều chỉnh nhỏ và sẽ thông báo trước tối thiểu 1 tuần.
4