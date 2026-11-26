# HW1 — Production Multi-Route Photo & Evidence Gallery SPA

Lab 04 — Multi-Route SPA Architecture (UIT S3T).

- **Sinh viên:** Nguyễn Ngọc Thiên Tú — 24521911
- **Trường:** UIT — VNUHCM

SPA thư viện ảnh nhiều route: lọc danh mục và mở ảnh lớn đều nằm trên URL (deep link), lightbox dùng `<dialog>` gốc của HTML, đạt WCAG 2.2 AA và Lighthouse 100 ở cả 4 hạng mục trên bản build production.

**Stack:** React 19 · Vite 8 · React Router v7 (package `react-router`) · Vitest 5 + Testing Library + jsdom · oxlint.

## Cách chạy

```bash
npm install          # cài dependencies (node_modules không được commit)
npm run dev          # dev server: http://localhost:5173
npm test             # chạy toàn bộ test (vitest run)
npm run lint         # oxlint
npm run build        # build production vào dist/
npm run preview      # phục vụ bản build: http://localhost:4173
npm run gen:photos   # sinh lại ảnh SVG mẫu trong public/photos/
```

> Trên Windows, hãy mở terminal ở đường dẫn có ký tự ổ đĩa viết hoa (`C:\...`). Nếu chạy từ `c:\...` (chữ thường, mặc định của terminal VS Code), Vitest có thể nạp module 2 lần và báo `Vitest failed to find the current suite` (xem AI-010 trong `AI_FAILURE_AUDIT.md`).

Kết quả hiện tại: **9 test file, 40 test pass**; lint 0 lỗi; build thành công.

## Đối chiếu yêu cầu → nơi hiện thực

| Yêu cầu | Hiện thực (file) | Test chứng minh |
|---|---|---|
| Deep linking bằng `useSearchParams` cho `?category=` và `?photoId=` | `src/features/gallery/GalleryPage.jsx`, `CategoryFilter.jsx`, `PhotoCard.jsx`, `src/lib/gallery.js` | `GalleryFilter.test.jsx`, `Lightbox.test.jsx`, `src/lib/gallery.test.js` |
| Lightbox bằng `<dialog>` gốc: `showModal()` / `close()`, sự kiện `onClose` đồng bộ URL; đóng bằng Esc, nút Đóng, click backdrop | `src/features/gallery/Lightbox.jsx` | `Lightbox.test.jsx` |
| Điều hướng ảnh bằng ← → / nút Trước–Sau, trả focus về thẻ ảnh khi đóng | `Lightbox.jsx`, `GalleryPage.jsx` | `LightboxNavigation.test.jsx` |
| React Router v7: `createBrowserRouter`, nested routes, `<Outlet />`, `NavLink className={({ isActive }) => ...}`, route `*` 404, `errorElement` | `src/App.jsx`, `src/routes.jsx`, `src/layouts/RootLayout.jsx`, `src/pages/NotFoundPage.jsx`, `src/pages/RouteErrorPage.jsx` | `App.test.jsx`, `GalleryFilter.test.jsx` (NavLink active), `NotFound.test.jsx` |
| `photoId` không hợp lệ → thông báo, không crash | `GalleryPage.jsx` | `NotFound.test.jsx` |
| Code splitting `React.lazy` + `<Suspense>` + skeleton (`aria-busy`, `aria-live`, CLS = 0) | `src/lazyPages.js`, `RootLayout.jsx`, `src/components/PageSkeleton.jsx` | `PageSkeleton.test.jsx` |
| WCAG 2.2 AA: skip link, `<title>` từng route (React 19 metadata), focus về `<main>` khi đổi route, `aria-label` cho icon button, vùng bấm ≥ 44px, contrast ≥ 4.5:1, `:focus-visible`, `scroll-padding-top` (2.4.11), `prefers-reduced-motion`, label-in-name (2.5.3) | `RootLayout.jsx`, `src/lib/pageTitle.js`, các trang trong `src/pages/`, `PhotoCard.jsx`, `src/index.css` | `src/a11y.test.jsx`; Lighthouse Accessibility = 100 |
| Ảnh: `width`/`height` rõ ràng, 4 ảnh đầu `loading="eager"` + `fetchpriority="high"`, còn lại `loading="lazy"`, `decoding="async"` | `PhotoGrid.jsx` (`PRIORITY_COUNT = 4`), `PhotoCard.jsx` | `PhotoGrid.test.jsx` |
| Lighthouse 100/100/100/100 (bản production) | xem bảng dưới | `docs/lighthouse/*.html` |

## Lighthouse (đo thực tế)

Đo ngày 26/11/2026 bằng Lighthouse 13.6.0 (Chrome headless) trên `npm run build` + `npm run preview` (cổng 4173), không đo trên dev server. Chỉ chạy 4 hạng mục performance, accessibility, best-practices, seo. Mặc định là mobile (giả lập Moto G Power, mạng 4G chậm).

| Trang | Thiết bị | Performance | Accessibility | Best Practices | SEO | LCP | CLS | Báo cáo |
|---|---|---|---|---|---|---|---|---|
| `/` | mobile | 100 | 100 | 100 | 100 | 0.8 s | 0 | [home-mobile.html](docs/lighthouse/home-mobile.html) |
| `/gallery` | mobile | 100 | 100 | 100 | 100 | 1.9 s | 0 | [gallery-mobile.html](docs/lighthouse/gallery-mobile.html) |
| `/gallery` | desktop | 100 | 100 | 100 | 100 | 0.5 s | 0.011 | [gallery-desktop.html](docs/lighthouse/gallery-desktop.html) |
| `/gallery?category=nature&photoId=p08` | mobile | 100 | 100 | 100 | 100 | 1.9 s | 0 | [gallery-deeplink-mobile.html](docs/lighthouse/gallery-deeplink-mobile.html) |
| `/about` | mobile | 100 | 100 | 100 | 100 | 1.7 s | 0 | [about-mobile.html](docs/lighthouse/about-mobile.html) |

Các thay đổi ở commit 14 để đạt các số trên:

- **Label in Name (WCAG 2.5.3):** Lighthouse báo `label-content-name-mismatch` vì hai `<span>` trong `figcaption` dính liền nhau. Đã thêm `{' '}` giữa chúng và `aria-label` của thẻ là `Xem ảnh lớn: <tiêu đề>, <địa điểm>`.
- **CLS `/gallery` desktop 0.168 → 0.011:** skeleton thấp hơn viewport nên ban đầu không có scrollbar. Khi lưới ảnh thật hiện ra thì scrollbar xuất hiện và đẩy layout sang ngang. Đã sửa bằng `html { scrollbar-gutter: stable; }`.
- **CLS `/about` 0.066 → 0 (Performance 99 → 100):** trang Giới thiệu đang dùng skeleton dạng lưới ảnh, cao hơn nhiều so với nội dung thật, nên footer bị kéo lên. Đã thêm `PageSkeleton variant="text"`, và `RootLayout` chọn variant dựa trên `pathname` ngay trong render.
- **LCP:** 4 ảnh đầu tải `eager` + `fetchpriority="high"`. LCP mobile của `/gallery` vẫn khoảng 1.9 s vì phải tải lần lượt `index.js` → chunk lazy `GalleryPage` → ảnh. Giữ nguyên chuỗi này vì `React.lazy` là yêu cầu của đề, và mức này vẫn nằm trong ngưỡng điểm 100.
- Thêm `public/robots.txt`. Nếu thiếu file này, `vite preview` trả về `index.html` và Lighthouse SEO báo robots.txt không hợp lệ.

## Kiến trúc

```
src/
├── main.jsx                 # createRoot + <StrictMode>
├── App.jsx                  # createBrowserRouter(routes) + <RouterProvider>
├── routes.jsx               # route contract: nested routes, index, *, errorElement
├── lazyPages.js             # React.lazy cho GalleryPage, AboutPage (tách file cho Fast Refresh)
├── layouts/RootLayout.jsx   # header + NavLink, skip link, <main> + <Suspense> + <Outlet />, footer
├── pages/                   # HomePage, AboutPage, NotFoundPage, RouteErrorPage
├── features/gallery/
│   ├── GalleryPage.jsx      # đọc ?category= & ?photoId=, dẫn xuất danh sách đã lọc
│   ├── CategoryFilter.jsx   # chip lọc → ghi ?category=
│   ├── PhotoGrid.jsx        # lưới ảnh, PRIORITY_COUNT
│   ├── PhotoCard.jsx        # <Link> ghi ?photoId= (giữ ?category=)
│   ├── Lightbox.jsx         # <dialog> gốc, ← →, Esc, backdrop
│   └── *.test.jsx
├── components/PageSkeleton.jsx   # Suspense fallback (grid | text)
├── data/photos.js           # data contract: CATEGORIES, PHOTOS (JSDoc typedef)
├── lib/gallery.js           # hàm thuần: parse/validate param, lọc, prev/next
├── lib/pageTitle.js         # tạo <title> theo route
├── a11y.test.jsx            # test WCAG 2.2
├── test/                    # setup.js, renderRoute.jsx (createMemoryRouter)
└── index.css                # design tokens, layout, focus-visible, reduced-motion
```

- **URL là nguồn sự thật.** `?category=` và `?photoId=` được đọc bằng `useSearchParams`. Không có `useState` nào sao chép lại chúng, nên mọi trạng thái đều chia sẻ được qua link, và nút Back/Forward hoạt động đúng.
- **State dẫn xuất được tính trong render.** Danh sách đã lọc, ảnh đang mở, prev/next, tiêu đề trang và loại skeleton đều tính trực tiếp từ URL và `pathname`. Không dùng chuỗi `useEffect` để derive state.
- **`useEffect` chỉ dùng để đồng bộ với DOM API.** Có hai chỗ: gọi `dialog.showModal()` / `dialog.close()` theo `photo` đang mở (`Lightbox.jsx`), và chuyển focus về `<main>` khi đổi route (`RootLayout.jsx`).
- Không dùng pattern bị cấm (`<Switch>`, `activeClassName`, `defaultProps`, ...). Giá trị mặc định của prop đều viết bằng default parameter.

## Lịch sử commit (Contract → Fail Test → Implement → Refactor)

```
ff5ca97 docs: define contract spec in project-rules.md                 ← Contract
bec12e1 init: scaffold hw1 photo gallery with vite + react 19          ← Setup
19a4875 chore: add react-router v7 and vitest testing setup            ← Setup
67ea34f feat: add photo data contract and category model               ← Contract
b735390 test: add failing test for url-driven category filter          ← Fail Test
90d2c0d feat: add react router v7 layout with outlet and navlink       ← Implement
056cb76 feat: implement category filter via useSearchParams            ← Implement
8d0db1c test: add failing test for photoId lightbox deep link          ← Fail Test
9c06cff feat: native html dialog lightbox synced to url                ← Implement
5c7a089 feat: keyboard prev/next navigation and focus return           ← Implement
af96c07 perf: route-level code splitting with lazy and suspense skeleton ← Refactor
e22dd02 feat: 404 route and invalid photoId boundary                   ← Implement
24043d6 a11y: skip link, focus-visible, aria labels, contrast          ← Refactor
3c20a42 perf: responsive images, explicit dimensions, lighthouse tuning ← Refactor
        docs: hw1 readme, lighthouse report and ai failure audit       ← Docs
```

Xem thêm: [`../project-rules.md`](../project-rules.md) · [`../TASK_DECOMPOSITION.md`](../TASK_DECOMPOSITION.md) · [`../AI_FAILURE_AUDIT.md`](../AI_FAILURE_AUDIT.md)
