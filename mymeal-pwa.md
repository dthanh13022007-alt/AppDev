# Kế hoạch phát triển: MyMeal — Ứng dụng PWA Quản lý Ăn uống & Chi tiêu

## Overview
Xây dựng ứng dụng **MyMeal** theo kiến trúc **PWA (Progressive Web App)**, tối ưu cho iPhone 14 (Mobile-first, Dynamic Island/Safe Area aware, touch targets ≥ 44px) và sử dụng mượt mà trên Windows Desktop.
Ứng dụng theo triết lý **Local-first (Offline-first)**, 100% miễn phí, không yêu cầu đăng nhập hay máy chủ trả phí; lưu trữ toàn bộ dữ liệu qua **IndexedDB** và hỗ trợ sao lưu / khôi phục thủ công qua tệp JSON.

## Project Type
WEB (PWA - React + TypeScript + Vite + Tailwind CSS + IndexedDB)

## Success Criteria (12 Tiêu chuẩn nghiệm thu v1.0)
- [x] 1. Mở được trên iPhone 14 và hiển thị chuẩn Safe Area (iOS Home Indicator & Dynamic Island)
- [x] 2. Thêm vào màn hình chính (Add to Home Screen) hoạt động như Native App
- [x] 3. Hoạt động bình thường khi mất Internet (Offline mode via Service Worker)
- [x] 4. Tạo và chỉnh sửa thực đơn 7 ngày (Sáng, Trưa, Tối, Phụ)
- [x] 5. Tự tạo danh sách đi chợ từ thực đơn và gộp nguyên liệu trùng
- [x] 6. Tính tổng tiền đi chợ (so sánh giá dự kiến vs giá mua thực tế)
- [x] 7. Quản lý ngân sách tháng (ví dụ 2.000.000đ) và tính chi tiêu TB/ngày
- [x] 8. Ghi nhận lịch sử thu chi theo danh mục (Thực phẩm, Đồ uống, Gia vị, Sinh hoạt, Học tập, Khác)
- [x] 9. Theo dõi kho thực phẩm tồn (Pantry) và cảnh báo nguyên liệu sắp hết
- [x] 10. Biểu đồ thống kê chi tiêu trực quan theo tuần/tháng
- [x] 11. Xuất dữ liệu ra file sao lưu JSON an toàn
- [x] 12. Khôi phục dữ liệu nguyên vẹn từ file JSON

## Tech Stack
- Frontend: React 18 + TypeScript
- Build Tool: Vite 6
- CSS & UI: Tailwind CSS (Mobile-first, Safe Area, Minimalist Warm Editorial)
- Local Database: IndexedDB qua Dexie.js + dexie-react-hooks (`useLiveQuery`)
- PWA: vite-plugin-pwa (Service Worker Cache & Manifest)
- Icons: lucide-react

## File Structure Hoàn thiện
```text
ag-project/
├── public/
│   └── favicon.svg
├── src/
│   ├── db/
│   │   ├── index.ts            # Dexie DB Instance
│   │   ├── schema.ts           # Type definitions
│   │   └── seedData.ts         # Món ăn & thực phẩm mẫu
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx      # Thanh tiêu đề & trạng thái online/offline
│   │   │   └── BottomNav.tsx   # Thanh điều hướng 5 tab chuẩn iPhone 14
│   │   ├── dashboard/
│   │   │   └── DashboardTab.tsx# Ngân sách tháng, thực đơn hôm nay, cảnh báo kho
│   │   ├── meals/
│   │   │   └── MealsTab.tsx    # Lên thực đơn 7 ngày & kho công thức
│   │   ├── shopping/
│   │   │   └── ShoppingTab.tsx # Đi chợ, tính tiền thực tế, cập nhật kho
│   │   ├── expenses/
│   │   │   └── ExpensesTab.tsx # Quản lý chi tiêu, biểu đồ 7 ngày & cơ cấu danh mục
│   │   ├── pantry/
│   │   │   └── PantryTab.tsx   # Quản lý kho thực phẩm, tăng giảm tồn
│   │   └── settings/
│   │       └── SettingsModal.tsx# Sửa ngân sách, xuất/nhập sao lưu JSON
│   ├── utils/
│   │   ├── formatters.ts       # Định dạng VNĐ, ngày tháng
│   │   └── backup.ts           # Sao lưu / Khôi phục tệp JSON
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── package.json
├── DESIGN.md
└── mymeal-pwa.md
```

## ✅ PHASE X COMPLETE
- TypeScript Compile (`tsc`): ✅ 0 errors
- Production Build (`vite build`): ✅ Thành công
- PWA Service Worker & Manifest: ✅ Sinh mã sw.js & precache 7 entries
- HTTP Preview Server: ✅ Chạy thành công (Status 200)
- Thiết kế: Tuân thủ 100% DESIGN.md, tối ưu cho iPhone 14 và Windows
- Date: 2026-11-15
