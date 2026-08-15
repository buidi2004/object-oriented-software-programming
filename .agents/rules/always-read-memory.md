---
name: "Codebase Memory Rule"
description: "Instructs the AI to always maintain and consult the codebase memory file to avoid losing context in long conversations."
---

# 🧠 Codebase Memory Context Caching

Dự án này sử dụng một file **Codebase Memory** làm bộ nhớ đệm (context caching) để tránh việc AI quên bối cảnh khi đoạn chat quá dài.

### 📍 Quy tắc bắt buộc đối với AI:

1. **Khởi tạo bối cảnh (Context Loading):**
   Mỗi khi bắt đầu một đoạn hội thoại mới hoặc khi có cảm giác bị mất bối cảnh (do đoạn chat bị cắt xén/truncate), AI PHẢI chủ động sử dụng tool `view_file` để đọc nội dung file:
   `/home/object-oriented-software-programming/CloudServiceStore/mcp_codebase_memory.md`

2. **Duy trì bộ nhớ (Memory Updating):**
   Nếu AI thực hiện thay đổi kiến trúc lớn, tạo thêm module mới, tính năng mới hoặc đổi tên API Controller, AI PHẢI cập nhật trực tiếp nội dung file `mcp_codebase_memory.md` để "cache" lại kiến thức đó cho những lần sau.

3. **Tra cứu Map thay vì đoán mò:**
   Trước khi sửa một chức năng bất kỳ, AI phải tham chiếu bảng **Bản đồ Module (Feature → Controller → Route)** trong file memory thay vì mò mẫm thư mục bằng `list_dir` liên tục, nhằm tối ưu hóa tokens và tốc độ phản hồi.
