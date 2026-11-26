# AI Failure Audit — Lab 04

> Ghi lại mọi đoạn code do AI sinh ra bị sai hoặc hallucinate, cùng cách kiểm chứng và sửa thủ công.
> (Chiếm 15% điểm Lab.)

## Template
| ID | HW | Prompt / Ngữ cảnh | Output sai của AI | Loại lỗi | Cách phát hiện | Cách sửa (engineering verification) | Commit |
|---|---|---|---|---|---|---|---|
| AI-000 | — | (ví dụ) | `<Switch>` trong RR v7 | Hallucinated API (v5) | Build lỗi `Switch is not exported` | Đổi sang `<Routes>` + `element` | `abc1234` |

## Phân loại lỗi
- **Hallucinated API** — method/prop không tồn tại hoặc đã bị gỡ.
- **Effect Loop** — `useEffect` thiếu deps hoặc set state gây vòng lặp.
- **Security** — hardcode secret, thiếu validate payload.
- **A11y** — thiếu label, sai role, mất focus.
- **Deprecated** — pattern cũ (defaultProps, Mongoose callback...).

## HW1 Log
| ID | HW | Prompt / Ngữ cảnh | Output sai của AI | Loại lỗi | Cách phát hiện | Cách sửa (engineering verification) | Commit |
|---|---|---|---|---|---|---|---|
| AI-001 | HW1 | Thêm router: `npm install react-router` | Cài bản v8 (tag `latest`) trong khi đề yêu cầu React Router v7 | Hallucinated API (sai phiên bản) | `npm ls react-router` hiển thị 8.x | Pin `npm install react-router@^7`, kiểm tra lại bằng `npm ls` | `19a4875` |
| AI-002 | HW1 | Tạo file tài liệu trong terminal | Sinh lệnh bash (`cat <<'EOF'`, `\|\|`, `2>/dev/null`) để chạy trên Windows PowerShell 5.1 | Sai môi trường (shell) | PowerShell báo `ParserError` | Dùng `[IO.File]::WriteAllText(path, @' ... '@)` (UTF-8 không BOM) | `ff5ca97` |
| AI-003 | HW1 | Scaffold Vite | `npm create vite ... -- --template react`: PowerShell có thể nuốt mất `--` nên flag không tới create-vite | Sai môi trường (shell) | Scaffolder hỏi tương tác / không dùng template react | `npx create-vite@latest <dir> --template react --no-interactive` | `bec12e1` |
| AI-004 | HW1 | Code splitting theo route | Khai báo `lazy()` ngay trong `routes.jsx` (file export cả component lẫn giá trị khác) | Lint / Fast Refresh | oxlint warning `react/only-export-components` | Tách các khai báo `lazy()` sang `src/lazyPages.js` | `af96c07` |
| AI-005 | HW1 | Refactor AI-004 | `routes.jsx` import `./lazyPages.js` nhưng file chưa được tạo | Hallucinated file | Vitest: `Failed to resolve import` ở 4 test suite | Tạo `src/lazyPages.js` đúng vị trí, chạy lại test xanh | `af96c07` |
| AI-006 | HW1 | Test lightbox `<dialog>` | Giả định jsdom không hỗ trợ `<dialog>` nên viết polyfill `showModal/close` | Giả định sai về môi trường | Kiểm tra thực tế: jsdom 31 đã có native `showModal/close` và ẩn dialog đóng khỏi accessibility tree | Polyfill chỉ chạy khi thiếu API; test dùng `role="dialog"` trực tiếp | `19a4875`, `8d0db1c` |
| AI-007 | HW1 | Thẻ ảnh có `aria-label` | Hai `<span>` trong `figcaption` dính liền nhau (không có khoảng trắng) | A11y (WCAG 2.5.3 Label in Name) | Lighthouse `label-content-name-mismatch` trên Chrome thật | Thêm `{' '}` giữa hai span; `aria-label` = `Xem ảnh lớn: <title>, <location>` | `3c20a42` |
| AI-008 | HW1 | Skeleton Suspense cho `/gallery` | Skeleton (8 thẻ) thấp hơn viewport → nội dung thật (12 ảnh) làm scrollbar xuất hiện → layout dịch ngang | Performance (CLS) | Lighthouse desktop: CLS = 0.168 ở `<main>` | `html { scrollbar-gutter: stable; }` → CLS 0.011 | `3c20a42` |
| AI-009 | HW1 | Clone repo sang máy mới rồi `npm test` | (Không phải lỗi code) `'vitest' is not recognized` | Môi trường | Thông báo lỗi của shell | `node_modules` bị `.gitignore` → chạy `npm install` trước | — |
| AI-010 | HW1 | Chạy `npm test` từ terminal VS Code | Mọi test suite fail: `Vitest failed to find the current suite` tại `afterEach` trong `setup.js`, kể cả ở HEAD sạch | Môi trường (Windows path casing) | So sánh: cwd `c:\...` (chữ thường) fail, `C:\...` (chữ hoa) pass 40/40; `npm ci` không giúp | Chạy từ đường dẫn ổ đĩa viết hoa; ghi chú trong README HW1 | — |
| AI-011 | HW1 | Suspense fallback dùng chung cho mọi route lazy | `/about` dùng skeleton dạng lưới ảnh, cao hơn nhiều nội dung thật → footer bị kéo lên | Performance (CLS) | Lighthouse mobile `/about`: CLS 0.066, Performance 99 | `PageSkeleton variant="text"`, `RootLayout` chọn variant theo `pathname` trong render → CLS 0, Performance 100 | `3c20a42` |

## HW2 Log

## HW3 Log