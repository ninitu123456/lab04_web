# Evidence — ảnh minh chứng Lab 04 (HW1 → HW3)

- **Sinh viên:** Nguyễn Ngọc Thiên Tú — 24521911 — UIT

Toàn bộ ảnh được chụp ngày 26/11/2026 bằng Chrome thật (chế độ headless, điều khiển qua puppeteer-core), trên ứng dụng đang chạy ở máy local:

- **HW1:** bản build production, chạy bằng `npm run preview` ở cổng 4173.
- **HW2:** client ở cổng 5173, API ở cổng 4000, DB `hw2`.
- **HW3:** client ở cổng 5174, API ở cổng 4001, DB `hw3`.

Ảnh không được chỉnh sửa. Một số trạng thái lỗi (HW2 07–08, HW3 10) được tạo bằng cách **chặn request ngay trong trình duyệt**, code của ứng dụng không bị sửa. Từng ảnh ghi rõ cách tạo ở cột mô tả.

Ảnh dữ liệu MongoDB được tạo bằng cách đọc trực tiếp DB local bằng driver Mongoose rồi hiển thị thành bảng. Đây là cùng dữ liệu MongoDB Compass hiển thị, nhưng ảnh không phải chụp màn hình Compass.

Ảnh kết quả test được tạo bằng cách chạy lệnh thật (`vitest run --reporter=verbose`, `oxlint`, `vite build`, `git log`, `npm ls`) rồi hiển thị output thành trang dạng terminal.

| Ảnh | Nội dung |
|---|---|
| [`git-log-and-versions.png`](git-log-and-versions.png) | `git log --oneline` của cả repo (vòng Contract → Fail Test → Implement → Refactor) và `npm ls` chứng minh đã pin `react-router@7.18.7`, `mongoose@8.24.11`, `express@5.3.0` |

## HW1 — Production Multi-Route Photo & Evidence Gallery SPA

| Ảnh | Nội dung |
|---|---|
| [`01-home.png`](hw1/01-home.png) | Trang chủ |
| [`02-skip-link-focus.png`](hw1/02-skip-link-focus.png) | Bấm Tab lần đầu thì skip link "Bỏ qua tới nội dung chính" hiện ra, có viền `:focus-visible` (WCAG 2.4.1) |
| [`03-gallery-all.png`](hw1/03-gallery-all.png) | `/gallery`: cả 12 ảnh, NavLink đang active |
| [`04-deeplink-category-nature.png`](hw1/04-deeplink-category-nature.png) | Deep link `?category=nature` (`useSearchParams`) |
| [`05-deeplink-lightbox-p08.png`](hw1/05-deeplink-lightbox-p08.png) | Deep link `?category=nature&photoId=p08`: lightbox `<dialog>` gốc mở thẳng, "Ảnh 2 / 3" |
| [`06-lightbox-arrow-next.png`](hw1/06-lightbox-arrow-next.png) | Bấm phím → thì URL đổi sang `photoId=p09` |
| [`07-invalid-photoid.png`](hw1/07-invalid-photoid.png) | `?photoId=khong-co`: hiện cảnh báo, không mở dialog |
| [`08-404.png`](hw1/08-404.png) | Route `*`: trang 404 |
| [`09-about.png`](hw1/09-about.png) | `/about` (trang lazy) |
| [`10-mobile-gallery.png`](hw1/10-mobile-gallery.png) | Giao diện mobile ở chiều rộng 390px |
| [`11-tests-lint-build.png`](hw1/11-tests-lint-build.png) | 40/40 test pass, lint sạch, build thành công |
| [`lighthouse-1`](hw1/lighthouse-1-home-mobile.png) … [`lighthouse-5`](hw1/lighthouse-5-about-mobile.png) | Lighthouse 13.6.0 trên bản production: `/` mobile, `/gallery` mobile, `/gallery` desktop, deep link lightbox mobile, `/about` mobile. Cả 5 trang đều **100/100/100/100**. Báo cáo HTML đầy đủ ở [`../hw1-photo-gallery/docs/lighthouse/`](../hw1-photo-gallery/docs/lighthouse/) |

## HW2 — Full-Stack Card-Swipe Deck ("Hẹn Hò Nhưng Không Yêu")

| Ảnh | Nội dung |
|---|---|
| [`01-deck-initial.png`](hw2/01-deck-initial.png) | Deck 12 hồ sơ hư cấu: bảng điểm, gợi ý phím tắt, 4 nút có `aria-label`; nút Hoàn tác bị disabled khi stack rỗng |
| [`02-pointer-dragging-right.png`](hw2/02-pointer-dragging-right.png) | Đang giữ chuột kéo sang phải 90px: thẻ dịch và nghiêng theo tay (đây là ảnh chụp sau khi đã sửa AI-030) |
| [`03-after-like-nope-super-score.png`](hw2/03-after-like-nope-super-score.png) | Kéo phải (LIKE), rồi ← (NOPE), rồi ↑ (SUPER): điểm 10 − 5 + 20 = **25**, tính từ `history` |
| [`04-after-backspace-undo.png`](hw2/04-after-backspace-undo.png) | Backspace: pop theo LIFO, thẻ SUPER quay lại đầu deck, điểm về 5 |
| [`05-after-reload-history-restored.png`](hw2/05-after-reload-history-restored.png) | Reload trang: lịch sử được khôi phục qua `GET /api/swipes?sessionId=…` |
| [`06-deck-empty-summary.png`](hw2/06-deck-empty-summary.png) | Màn hình hết thẻ, có tổng kết |
| [`07-load-error-retry.png`](hw2/07-load-error-retry.png) | *(chặn request `/api/profiles` trong trình duyệt)*: hiện `role="alert"` kèm nút Thử lại |
| [`08-swipe-rollback-alert.png`](hw2/08-swipe-rollback-alert.png) | *(cho `POST /api/swipe` trả 500)*: optimistic update bị rollback, thẻ quay lại, hiện thông báo `role="alert"` có nút đóng |
| [`09-mongodb-hw2-data.png`](hw2/09-mongodb-hw2-data.png) | DB `hw2`: collection `profiles` (12) và `swipes` (theo `sessionId`) |
| [`10-tests-server.png`](hw2/10-tests-server.png) | Server: 20/20 test (supertest + DB test) |
| [`11-tests-client-lint-build.png`](hw2/11-tests-client-lint-build.png) | Client: 75/75 test, lint sạch, build thành công |

## HW3 — Fair-Play Appeal Tribunal (dữ liệu giả lập phục vụ bài tập)

| Ảnh | Nội dung |
|---|---|
| [`01-portal.png`](hw3/01-portal.png) | Cổng Tribunal: 2 hồ sơ (Himass, TanVuu), có ghi chú dữ liệu giả lập |
| [`02-dossier-himass-overview.png`](hw3/02-dossier-himass-overview.png) | `/dossier/himass` (`useParams`): tổng quan, bằng chứng, đồng hồ SLA đã đồng bộ với server |
| [`03-dossier-tanvuu-matrix.png`](hw3/03-dossier-tanvuu-matrix.png) | Deep link `/dossier/tanvuu/matrix`: ma trận `<table>` có `<caption>`, mỗi đánh giá có cả biểu tượng lẫn chữ; tab đang chọn có `aria-current` |
| [`04-dossier-404.png`](hw3/04-dossier-404.png) | `/dossier/khong-co`: 404 boundary |
| [`05-appeal-invalid.png`](hw3/05-appeal-invalid.png) | Bấm Gửi với dữ liệu lỗi: tóm tắt "Có 6 lỗi cần sửa", lỗi `role="alert"` hiện dưới từng field, focus vào field lỗi đầu tiên |
| [`06-appeal-filled.png`](hw3/06-appeal-filled.png) | Form đã điền hợp lệ, có bộ đếm ký tự |
| [`07-appeal-showdata.png`](hw3/07-appeal-showdata.png) | `POST /api/appeals` trả 201, `<ShowData />` hiện dạng `<dl>/<dt>/<dd>` |
| [`08-sla-after-tab-return.png`](hw3/08-sla-after-tab-return.png) | Sau khi ẩn tab 150 giây rồi quay lại: đồng hồ resync và lệch **55 ms** so với `deadline − server now` (zero-drift) |
| [`09-mobile-matrix.png`](hw3/09-mobile-matrix.png) | Ma trận trên mobile ở chiều rộng 390px (bảng cuộn ngang được) |
| [`10-sla-expired-form-blocked.png`](hw3/10-sla-expired-form-blocked.png) | *(sửa `slaDeadline` trong phản hồi thành thời điểm đã qua)*: hiện "⛔ Đã hết hạn kháng cáo" và form bị chặn submit |
| [`11-realtime-validation-cross-field.png`](hw3/11-realtime-validation-cross-field.png) | Validate real-time sau blur: lỗi cross-field `confirmEmail`, statement chưa đủ 50 ký tự |
| [`12-mongodb-hw3-data.png`](hw3/12-mongodb-hw3-data.png) | DB `hw3`: `dossiers` (2) và `appeals` (bản ghi `pending`, không lưu `confirmEmail`/`acceptTerms`) |
| [`13-tests-shared-server.png`](hw3/13-tests-shared-server.png) | `shared` 20/20 và `server` 22/22, gồm cả test parity với `validateAppeal` |
| [`14-tests-client-lint-build.png`](hw3/14-tests-client-lint-build.png) | Client 52/52, gồm test zero-drift bằng fake timer; lint sạch, build thành công |

Hai lỗi hiển thị được phát hiện nhờ xem lại các ảnh này, sau khi các HW đã commit xong: AI-030 (thẻ HW2 không nghiêng khi kéo) và AI-031 (HW3 hiện "lúc lúc"). Cả hai đã được sửa trước khi chụp bộ ảnh cuối cùng, chi tiết xem [`../AI_FAILURE_AUDIT.md`](../AI_FAILURE_AUDIT.md).
