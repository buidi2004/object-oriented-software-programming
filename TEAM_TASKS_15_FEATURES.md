# LỆNH: Đọc Log GitHub Actions & Fix Lỗi CI Cho Toàn Bộ Backend (Không Fix Giả)

## Bối cảnh
Pipeline `CI Develop` đang fail rải rác nhiều run (nullability warnings, test conflict, mock service không được inject...). Cần 1 quy trình chuẩn để AI **tự đọc đúng log thật** (không đoán qua tiêu đề commit) và sửa **đúng gốc rễ**, áp dụng cho toàn bộ Backend (Domain/Application/Infrastructure/WebApi/Tests), không riêng 6 service provisioning.

## Bước 1 — Lấy log THẬT, không đoán
Dùng GitHub CLI (`gh`), KHÔNG đọc qua screenshot/tiêu đề commit vì không đủ chi tiết:
```bash
gh run list --workflow "CI Develop" --limit 20
gh run view <run-id> --log-failed
```
Nếu chưa cài `gh` hoặc chưa login, phải tự cài/login trước, không được "tự suy đoán" nội dung log.

## Bước 2 — Phân loại lỗi trước khi sửa
Với mỗi run fail, đọc **toàn bộ stack trace** (không chỉ dòng lỗi cuối cùng), phân loại:
- Compile error / nullability warning (treat-as-error).
- Unit/Integration test fail (assert sai, hoặc code sai).
- Test fail do môi trường CI khác local (thiếu biến môi trường, connection string, service chưa inject...).
- Flaky test (fail ngẫu nhiên, không liên quan code vừa đổi).

Ghi rõ root cause thật trước khi động tay sửa — không sửa mò.

## Bước 3 — CẤM các kiểu "fix giả" sau (rất hay gặp khi AI muốn CI xanh nhanh)
1. **Không** thêm `[Fact(Skip = "...")]`, `[Ignore]`, hoặc comment/xoá test đang fail để né lỗi.
2. **Không** `catch (Exception) { }` nuốt lỗi im lặng chỉ để qua compile/runtime.
3. **Không** sửa `Assert` trong test cho khớp với **output sai hiện tại** — phải sửa code cho đúng **behavior đúng theo nghiệp vụ**, rồi mới xác nhận test pass.
4. **Không** tắt `TreatWarningsAsErrors` hoặc thêm `#pragma warning disable` bừa bãi để né warning — phải sửa warning thật (VD nullability: thêm `?`, null-check, hoặc required member đúng chỗ).
5. **Không** mock/fake lại logic đang được test integration thật (lặp lại đúng lỗi self-signed SSL đã xảy ra trước đó) — nếu test fail vì thiếu service DI, phải register đúng service thật, không thay bằng mock cho "qua bài".
6. **Không** hardcode giá trị test-only vào code production chỉ để test pass.

Nếu không chắc cách sửa nào đúng nghiệp vụ, phải dừng lại hỏi thay vì tự chọn cách né lỗi nhanh nhất.

## Bước 4 — Sửa & tự verify LOCAL trước khi push
1. Sửa code thật theo root cause đã xác định ở Bước 2.
2. Build local: `dotnet build` — 0 warning, 0 error.
3. Chạy lại **toàn bộ** test suite liên quan (không chỉ test đang fail) để đảm bảo fix không phá chỗ khác: `dotnet test`.
4. Nếu lỗi liên quan CI-only (khác local), phải mô phỏng đúng điều kiện CI (biến môi trường, DB thật thay vì SQLite in-memory nếu CI dùng DB thật...) trước khi kết luận đã fix — không suy đoán.

## Bước 5 — Xác nhận ổn định, không flaky
Sau khi push, chạy lại pipeline **tối thiểu 2 lần liên tiếp** (`gh run rerun <run-id>`), phải pass cả 2 lần mới coi là xong — 1 lần pass có thể là ăn may (đặc biệt với test liên quan network/Docker/timing).

## Bước 6 — Report rõ ràng cho từng lỗi đã fix
Với mỗi run đã fix, ghi lại:
- Root cause thật là gì (không phải "đã fix" chung chung).
- Cách sửa cụ thể (file nào, thay đổi gì).
- Đã verify local + CI pass lại bao nhiêu lần.

## Definition of Done
- `gh run list --workflow "CI Develop" --limit 20` không còn run nào fail do lỗi đã biết.
- Build local 0 warning/0 error trên toàn bộ solution (không riêng 6 service provisioning).
- Toàn bộ test suite pass ổn định qua ít nhất 2 lần chạy lại liên tiếp trên CI.
- Không có bất kỳ `Skip`/`Ignore`/`catch rỗng`/`pragma disable` nào mới được thêm vào chỉ để né lỗi.