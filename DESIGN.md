---
name: MyMeal Design System
version: 1.0.0
colors:
  primary: "#1e293b"
  primary-hover: "#0f172a"
  surface: "#ffffff"
  surface-canvas: "#fafaf9"
  surface-subtle: "#f5f5f4"
  border: "#e7e5e4"
  border-hover: "#d6d3d1"
  text-main: "#1c1917"
  text-muted: "#78716c"
  text-subtle: "#a8a29e"
  accent-food: "#d97706"
  accent-food-light: "#fef3c7"
  accent-success: "#059669"
  accent-success-light: "#ecfdf5"
  accent-danger: "#e11d48"
  accent-danger-light: "#fff1f2"
  # Dark theme tokens
  dark-surface: "#181b24"
  dark-surface-canvas: "#0f1117"
  dark-surface-subtle: "#202430"
  dark-border: "#2b303e"
  dark-text-main: "#f5f5f4"
  dark-text-muted: "#a8a29e"
typography:
  headline-display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  headline-md:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.3
  body-md:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "20px"
  xl: "28px"
components:
  bottom-nav:
    height: "64px"
    backgroundColor: "{colors.surface}"
    borderTop: "1px solid {colors.border}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
    border: "1px solid {colors.border}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "12px 16px"
---

# MyMeal - Design Specification (PWA & iOS 16+)

## Overview
MyMeal là ứng dụng Progressive Web App (PWA) quản lý ăn uống, đi chợ và ngân sách cá nhân. Giao diện được thiết kế theo phong cách **Warm Minimalist Editorial**, tối ưu hóa tuyệt đối cho trải nghiệm một tay trên **iPhone 14** (Dynamic Island, Safe Area Insets) và mở rộng tự nhiên trên màn hình lớn của Windows.

## Colors & Palette
- **Warm Canvas (#fafaf9 / #ffffff):** Tạo cảm giác giấy ấm áp, thân thiện với người dùng gia đình và sinh viên.
- **Deep Slate (#1e293b):** Màu văn bản chính và các nút điều hướng quan trọng, tạo độ tương phản cao đạt chuẩn WCAG AA.
- **Amber Terracotta (#d97706):** Điểm nhấn ẩm thực ấm cúng cho thực đơn và danh mục món ăn.
- **Emerald Green (#059669):** Trạng thái đã mua thực phẩm, tiết kiệm ngân sách và trong định mức.
- **Crimson Rose (#e11d48):** Cảnh báo vượt ngân sách và hết nguyên liệu trong kho.
- **Tuân thủ lệnh cấm màu tím (Purple Ban):** 100% không dùng màu tím/violet làm màu thương hiệu.

## Typography
- Hệ thống phông Native Apple System Typography (`SF Pro Display`, `SF Pro Text`) mang lại cảm giác mượt mà như ứng dụng native iOS.
- Phân cấp rõ rệt: Số tiền to rõ ràng, tên món ăn nổi bật, định lượng và giá ước tính hiển thị tinh tế.

## iPhone 14 & Safe Area Layout
- **Viewport Constraints**: Màn hình chính tối ưu cho kích thước chuẩn 390px × 844px của iPhone 14.
- **Safe Area Insets**:
  - `padding-top: env(safe-area-inset-top)` để tránh che khuất bởi Dynamic Island / Notch.
  - `padding-bottom: calc(env(safe-area-inset-bottom) + 64px)` cho thanh Bottom Navigation để không bị cản bởi Home Indicator.
- **Touch Target**: Mọi nút bấm, tab điều hướng và checkbox đều có diện tích chạm tối thiểu 44px × 44px.

## Navigation & Ergonomics
- Thanh điều hướng cố định phía dưới màn hình (Bottom Navigation Bar) gồm 5 tab cốt lõi:
  1. 📊 **Tổng quan (Dashboard)**
  2. 🍲 **Thực đơn (Meals)**
  3. 🛒 **Đi chợ (Grocery)**
  4. 💰 **Chi tiêu (Expenses)**
  5. 🥫 **Kho đồ (Pantry)**
- Nút tác vụ nhanh (Floating / Header action) để ghi nhanh khoản chi hoặc thêm món.

## Do's and Don'ts
- **DO**: Hỗ trợ cảm ứng vuốt nhẹ, phản hồi xúc giác thị giác (active scale feedback).
- **DO**: Đảm bảo hiển thị số tiền định dạng chuẩn tiếng Việt (`2.000.000 đ`).
- **DON'T**: Sử dụng dropdown select phức tạp trên mobile; ưu tiên modal sheet đáy màn hình (Bottom Sheet).
- **DON'T**: Che khuất nội dung bởi bàn phím ảo iOS.
