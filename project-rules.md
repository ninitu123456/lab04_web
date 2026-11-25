# Project Rules — Lab 04 (UIT S3T)

> "Generate with AI. Verify with Engineering."

## 1. Tech Stack (bắt buộc)
| Layer | Công nghệ |
|---|---|
| UI | React 19 + Vite |
| Routing | React Router v7 (package `react-router`) |
| Test | Vitest + @testing-library/react + jsdom |
| Backend (HW2, HW3) | Node 20+, Express 5, Mongoose 8 (async/await) |

## 2. Strict 4-Stage Contract-First Loop
1. **Contract** — định nghĩa interface/props/API shape trước.
2. **Fail Test** — viết test tự động chạy ĐỎ.
3. **Implement** — code tối thiểu để test XANH.
4. **Refactor** — dọn code, test vẫn XANH.

## 3. Atomic Git Commits
- Mỗi commit chỉ một phạm vi, dùng Conventional Commits:
  `init:` `feat:` `fix:` `test:` `refactor:` `perf:` `a11y:` `docs:` `chore:`
- Mỗi homework tối thiểu **12 commit**.
- Không commit `node_modules`, `dist`, `.env`.

## 4. Banned Patterns (Deprecation Audit)
| ❌ Cấm | ✅ Thay bằng |
|---|---|
| `<Switch>`, `<Redirect>`, `exact`, `component={}` | `<Routes>`, `<Route element={}>`, `<Navigate>` |
| `activeClassName` | `NavLink className={({ isActive }) => ...}` |
| `Component.defaultProps` | Default parameter `function C({ x = 1 })` |
| `react-media`, `@material-ui/core`, `typeface-roboto` | CSS Grid + `@media`, semantic HTML, `@font-face` |
| `useEffect` chain để validate / derive state | Tính đồng bộ trong render (`useMemo` nếu nặng) |
| `didCancel` boolean flag | `AbortController` + `signal` |
| Hardcode MongoDB URI | `process.env.MONGODB_URI` |
| Mongoose callback `(err, doc) => {}` | `await Model.find().exec()` |
| Icon button không label | `aria-label` bắt buộc |

## 5. State Rules
- **URL là nguồn sự thật** cho state cần chia sẻ qua link (filter, modal đang mở, pagination) → `useSearchParams`.
- State dẫn xuất (derived) KHÔNG lưu vào `useState`.
- `useEffect` chỉ dùng để đồng bộ với hệ thống bên ngoài (DOM API như `dialog.showModal()`, network, event listener), luôn có cleanup và dependency array đầy đủ.

## 6. Accessibility — WCAG 2.2 AA
- Semantic HTML: `<header> <nav> <main> <footer> <dialog> <dl>`.
- Contrast chữ ≥ 4.5:1; focus luôn nhìn thấy (`:focus-visible`) và không bị che (2.4.11).
- Kích thước vùng bấm ≥ 24×24px (2.5.8).
- Ảnh có `alt` có nghĩa; ảnh trang trí dùng `alt=""`.
- Modal: focus vào dialog khi mở, `Esc` để đóng, trả focus về phần tử đã mở nó.
- Nội dung động: `aria-live="polite"`; trạng thái loading: `aria-busy="true"`.

## 7. Performance
- Code splitting theo route bằng `React.lazy` + `<Suspense>`.
- Skeleton fallback cùng kích thước với nội dung thật → CLS = 0.
- `<img>` luôn có `width`/`height`, `loading="lazy"`, `decoding="async"`; ảnh đầu tiên dùng `fetchpriority="high"`.
- Mục tiêu Lighthouse (bản build production): Performance / Accessibility / Best Practices / SEO = 100.

## 8. Definition of Done (mỗi commit `feat:`)
- [ ] `npm run test` xanh
- [ ] `npm run lint` không lỗi
- [ ] Console DevTools không có warning
- [ ] Cập nhật checkbox trong `TASK_DECOMPOSITION.md`