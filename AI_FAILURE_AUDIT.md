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
| ID | HW | Prompt / Ngữ cảnh | Output sai của AI | Loại lỗi | Cách phát hiện | Cách sửa (engineering verification) | Commit |
|---|---|---|---|---|---|---|---|
| AI-012 | HW2 | Cài backend: `npm install mongoose` | Cài Mongoose v9 (tag `latest`) trong khi đề và slide dùng Mongoose 8 | Hallucinated API (sai phiên bản) | `npm ls mongoose` hiển thị 9.x | Pin `mongoose@^8` (8.24.11), không nâng cấp | `48cca61` |
| AI-013 | HW2 | Chuỗi kết nối MongoDB local | `mongodb://localhost:27017/hw2`: Node ≥ 18 có thể phân giải `localhost` thành `::1` (IPv6) trong khi mongod chỉ nghe IPv4 | Sai môi trường | `ECONNREFUSED ::1:27017` | Dùng `mongodb://127.0.0.1:27017/hw2` trong `.env.example`, `connectDb` có `serverSelectionTimeoutMS: 5000` | `48cca61` |
| AI-014 | HW2 | Code mẫu slide 31 `handlePointerUp` | Đọc `startPos.x` khi `startPos` có thể null (pointerup không có pointerdown trước đó, ví dụ bắt đầu kéo từ ngoài thẻ) | Runtime crash | Test `pointerup without a pointerdown does not crash` | Lưu điểm bắt đầu trong `useRef`, guard null + kiểm tra `pointerId`, `setPointerCapture`, xử lý `pointercancel` | `fe87557` |
| AI-015 | HW2 | Code mẫu slide 31 | `useState` cho `startPos` → mỗi lần chạm/kéo đều re-render cả deck | Performance (re-render thừa) | Review: `startPos` không xuất hiện trong JSX | Chuyển sang `useRef`; hiệu ứng kéo cập nhật qua CSS variable (`--drag-x/--drag-y`), không qua state | `fe87557` |
| AI-016 | HW2 | Phím Backspace = undo | Gắn Backspace mà không `preventDefault()` và không xét target → có thể điều hướng lùi (trình duyệt cũ) / chặn việc xoá chữ trong ô nhập | A11y / UX | Test `Backspace calls onUndo and prevents the browser default`, `Backspace inside a text field keeps its default behaviour` | `preventDefault()` trên vùng deck; bỏ qua khi target là input/textarea/select/contentEditable | `f00bdd5` |
| AI-017 | HW2 | Test API bằng `mongodb-memory-server` | `npm install -D mongodb-memory-server` treo hơn 10 phút: postinstall tải `mongodb-windows-x86_64-8.2.6.zip` đứng ở 64 KB | Sai môi trường (mạng) | File `.zip.downloading` không tăng kích thước | Cài với `--ignore-scripts`; `testDb.js` dùng `MONGODB_URI_TEST` (DB `hw2_test`, đọc từ `.env` qua `vitest.config.js`) khi có, ngược lại dùng memory server; chốt an toàn: tên DB phải kết thúc bằng `_test` | `1cc24e7` |
| AI-018 | HW2 | Tick checkbox bằng PowerShell 5.1 | `(Get-Content f -Raw) -replace … \| Set-Content -Encoding utf8`: `Get-Content` đọc UTF-8 như ANSI và `Set-Content` chèn BOM → tiếng Việt trong `TASK_DECOMPOSITION.md` bị lỗi font (`—` thành `â€”`) | Sai môi trường (encoding) | `git diff --cached` hiện các dòng mojibake (phát hiện sau khi đã push) | Khôi phục nội dung từ `48cca61`, chỉ sửa bằng `sed`/Python UTF-8; không force-push, sửa trong commit kế tiếp | `1cc24e7` → sửa ở `fe87557` |
| AI-019 | HW2 | Chèn helper `isTextInput` vào `SwipeDeck.jsx` | Chèn hàm ngay trước `export default function` → nằm giữa JSDoc `@param` của component và component | Tài liệu / contract sai chỗ | Review diff trước khi chạy test | Chuyển helper lên trên khối JSDoc | `f00bdd5` |

## HW3 Log