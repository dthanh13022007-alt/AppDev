# Kế hoạch phát triển: Ứng dụng Todo List (HTML, CSS, JS)

## Overview
Xây dựng một ứng dụng web Todo List độc lập, tải nhanh, trực quan và dễ sử dụng bằng bộ ba công nghệ web tiêu chuẩn: **HTML5**, **CSS3**, và **JavaScript thuần (Vanilla JS)**.
Ứng dụng cho phép người dùng quản lý công việc hàng ngày một cách hiệu quả với trải nghiệm mượt mà, lưu trữ dữ liệu an toàn trên trình duyệt qua `localStorage` và giao diện tương thích tốt trên mọi thiết bị (Responsive).

## Project Type
WEB (Vanilla HTML5 / Modern CSS / JavaScript ES6+)

## Success Criteria
- [x] Giao diện hiện đại, sạch sẽ, chuẩn responsive (Mobile & Desktop)
- [x] CRUD cơ bản: Thêm việc, đánh dấu hoàn thành, xoá từng việc
- [x] Bộ lọc trạng thái: Tất cả (All), Đang làm (Active), Đã xong (Completed)
- [x] Đếm số việc cần làm còn lại và nút dọn dẹp các việc đã hoàn thành (Clear completed)
- [x] Lưu trữ dữ liệu lâu bền với `localStorage` (không mất khi tải lại trang F5)
- [x] Xử lý an toàn dữ liệu đầu vào (chống XSS)

## Tech Stack
- HTML5 (Semantic tags, ARIA attributes)
- CSS3 (CSS Variables, Flexbox, Transitions)
- JavaScript ES6+ (Event-driven, LocalStorage API)

## File Structure
```text
ag-project/
├── DESIGN.md        # Đặc tả thiết kế và design tokens
├── index.html       # Giao diện chính ngữ nghĩa
├── style.css        # Giao diện, responsive, theme tokens
└── app.js           # Xử lý logic, state & LocalStorage
```

## Task Breakdown
- [x] **Task 1**: Tạo cấu trúc Semantic HTML (`index.html`) bao gồm container, input form, danh sách task và toolbar bộ lọc. (Agent: `frontend-specialist`, Skill: `frontend-architecture`)
- [x] **Task 2**: Viết CSS Styling hiện đại (`style.css`) với hệ thống màu chuẩn, responsive và transition mượt mà. (Agent: `frontend-specialist`, Skill: `frontend-design`)
- [x] **Task 3**: Xây dựng Core Logic & State Management (`app.js`) xử lý thêm việc, toggle hoàn thành, xoá việc và lưu `localStorage`. (Agent: `frontend-specialist`, Skill: `clean-code`)
- [x] **Task 4**: Thêm tính năng lọc trạng thái (All / Active / Completed) và dọn dẹp các việc đã xong. (Agent: `frontend-specialist`, Skill: `clean-code`)
- [x] **Task 5**: Kiểm thử thủ công, kiểm tra responsive trên mobile và xác nhận tính toàn vẹn dữ liệu. (Agent: `test-engineer`, Skill: `verify-changes`)

## ✅ PHASE X COMPLETE
- Syntax check (`node --check app.js`): ✅ Pass
- Code structure & Zero external dependency: ✅ Pass
- Design consistency with DESIGN.md: ✅ Pass
- Security (Sanitized inputs, XSS prevention): ✅ Pass
- Responsive mobile & desktop: ✅ Pass
- Date: 2026-11-04
