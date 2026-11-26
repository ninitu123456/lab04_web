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
| AI-030 | HW2 | Hiệu ứng nghiêng thẻ khi kéo (CSS) | `rotate(calc(var(--drag-x) / 20))` → `calc(90px / 20)` = độ dài `4.5px`, không phải góc → cả khai báo `transform` không hợp lệ, thẻ đứng yên khi kéo (vuốt vẫn hoạt động nên test chức năng không bắt được) | CSS sai đơn vị | Chụp ảnh evidence trên Chrome thật khi đang giữ chuột kéo 90px: thẻ không dịch/nghiêng | JS tính sẵn `--drag-rot: ${dx / 20}deg`, CSS dùng `rotate(var(--drag-rot))`; test kiểm tra `--drag-rot = 4deg` khi kéo 80px và về `0deg` khi thả | `36a34aa` |

## HW3 Log

| ID | HW | Prompt / Ngữ cảnh | Output sai của AI | Loại lỗi | Cách phát hiện | Cách sửa (engineering verification) | Commit |
|---|---|---|---|---|---|---|---|
| AI-020 | HW3 | Scaffold client + server HW3 | `npm install react-router` / `npm install mongoose` lấy tag `latest` = React Router **v8** / Mongoose **v9**, trong khi đề yêu cầu v7 / v8 (lặp lại AI-001, AI-012) | Hallucinated API (sai phiên bản) | `npm ls react-router mongoose` | Dùng lại `package.json` đã pin của HW1/HW2: `react-router@^7` (7.18.7), `mongoose@^8` (8.24.11); kiểm tra lại bằng `npm ls` sau khi cài | `7ef505c` |
| AI-021 | HW3 | Code mẫu slide 33 | Khai báo 2 route cứng `/dossier/himass`, `/dossier/tanvuu` (thêm hồ sơ = thêm route + component, trùng lặp, không có 404 cho id lạ) | Kiến trúc (vi phạm slide 21) | Đối chiếu slide 21 (route động `useParams`) | MỘT route `/dossier/:playerId`; id ngoài `PLAYER_IDS` (contract chung) hoặc server 404 → 404 boundary; test `/dossier/khong-co` | `dc95bfb` |
| AI-022 | HW3 | Validate form (slide 13) | "Validation waterfall": `useEffect(() => setErrors(validate(values)), [values])` → render thừa 1 nhịp, lỗi hiển thị trễ 1 frame, dễ thành effect loop khi effect set thêm state khác | Effect Loop / derived state sai chỗ | Review theo rule "useEffect chỉ để đồng bộ hệ thống ngoài" | `const clientErrors = validateAppeal(values)` ngay trong render; test đọc source khẳng định `FormContext.js` / `AppealForm.jsx` / `fields.jsx` / `ShowData.jsx` không import/gọi `useEffect` | `9960669` |
| AI-023 | HW3 | Đồng hồ SLA | Đếm ngược bằng `setRemaining(r => r - 1000)` trong `setInterval` → tab ẩn bị trình duyệt throttle timer → đồng hồ chạy chậm (drift) | Logic thời gian (drift) | Test fake timer: `setSystemTime(+10 phút)` nhưng chỉ chạy 1 tick → đếm tick chỉ giảm 1s | `remainingMs = deadline − (Date.now() + offset)` đọc lại mỗi tick; offset từ `GET /api/time` (điểm giữa t0/t1); `visibilitychange` → resync. E2E Chrome: ẩn tab 150s, lệch 15 ms | commit 5 HW3 (`feat: zero-drift useAppealSlaTimer …`) |
| AI-024 | HW3 | Phiên bản đầu của `useAppealSlaTimer` | Gọi `Date.now()` trực tiếp trong thân render (`const remainingMs = deadline - (Date.now() + offset)`) | Lint / React purity | oxlint `react(purity)`: "Cannot call impure function during render" | Giữ `now` trong state (`useState(() => Date.now())`), tick/visibility gọi `setNow(Date.now())` — vẫn là giá trị tuyệt đối, không cộng dồn; test (a)–(d) vẫn xanh | commit 5 HW3 |
| AI-025 | HW3 | Hiện lỗi field khi blur | Bấm "Gửi" khi đang focus một field: `mousedown` → blur → dòng lỗi mới chèn vào → nút submit bị đẩy xuống giữa `mousedown` và `mouseup` → trình duyệt **không phát `click`** → form không submit, người dùng không thấy gì | UX / A11y (layout shift nuốt click) | E2E trên Chrome thật (puppeteer): sau khi gõ email sai rồi click Gửi, không có tóm tắt lỗi; `document.activeElement` là nút nhưng không có submit. jsdom không có layout nên test unit không bắt được | `markTouched(name, event)` bỏ qua khi `event.relatedTarget` là nút submit của chính form (lần submit sẽ hiện mọi lỗi ngay sau đó); thêm test `fireEvent.blur(email, { relatedTarget: submit })`; E2E chạy lại: click ngay sau blur → "Có 6 lỗi cần sửa" | commit 5 HW3 |
| AI-026 | HW2, HW3 | Ghi nhiều file bằng một lệnh Bash dài (nhiều heredoc `<<'EOF'` + Python inline) | Lệnh bị shell báo `unexpected EOF while looking for matching '` → **không file nào được ghi** (2 lần: test HW2 commit 4, models/routes HW3 commit 2) | Sai môi trường (công cụ) | Thông báo lỗi shell + `ls` thấy thư mục chưa tồn tại | Ghi từng file bằng công cụ ghi file (không qua shell quoting); kiểm tra lại bằng `ls`/`git status` trước khi chạy test | `f00bdd5`, `f71922c` |
| AI-027 | HW3 | Test deep link tab con | Dùng `getByRole` (đồng bộ) cho nội dung tab con, quên rằng tab con cũng là `React.lazy` → Suspense đang hiện skeleton | Test sai (async) | Vitest fail: không tìm thấy heading `HM-01`, DOM đang là skeleton | Đổi sang `await findByRole(...)` + comment giải thích | `dc95bfb` |
| AI-028 | HW3 | Mock API trong test | Destructuring bỏ field `const { confirmEmail, acceptTerms, ...rest } = body` | Lint | oxlint `no-unused-vars` (2 cảnh báo) | Đổi tên `confirmEmail: _confirmEmail` theo quy ước; lint 0 cảnh báo | `dc95bfb` |
| AI-029 | HW3 | Test "engine không có useEffect" bằng cách đọc source (`?raw`) | Regex `/\buseEffect\b/` khớp cả chữ "useEffect" trong **comment JSDoc** giải thích → test đỏ dù code đúng (false positive) | Test sai | Vitest fail ở `AppealForm.jsx`, kiểm tra thấy chỉ có trong comment | Bỏ comment khỏi source trước khi so khớp; kiểm tra cả `useLayoutEffect` | `9960669` |
| AI-031 | HW3 | Nhãn hạn SLA trong `SlaCountdown` | Viết cứng `Hết hạn lúc {Intl…format(date)}` trong khi `Intl.DateTimeFormat('vi-VN', { dateStyle, timeStyle })` đã trả về chuỗi bắt đầu bằng "lúc …" → hiển thị "Hết hạn lúc lúc 09:51:45" | Định dạng hiển thị / i18n | Xem ảnh evidence trạng thái hết hạn | Đổi nhãn thành "Thời điểm hết hạn:"; test khẳng định không có "lúc lúc" | `fix: hw3 sla deadline label no longer repeats "lúc"` |

## Post-Mortem — Lab 4 (HW1 → HW3)

**Tổng quan.** Lab 4 ghi nhận 31 sự cố thật (AI-001 đến AI-031): HW1 có 11, HW2 có 9, HW3 có 11. Hai sự cố cuối (AI-030, AI-031) được phát hiện khi chụp ảnh minh chứng sau khi các HW đã commit xong, và được sửa bằng commit `fix:` riêng. Tất cả đều được phát hiện bằng công cụ kiểm chứng, không có sự cố nào được bịa thêm cho đủ số lượng.

### Loại lỗi AI hay gặp nhất

| Nhóm | Số lượng | ID | Nhận xét |
|---|---|---|---|
| Sai môi trường / công cụ (Windows, PowerShell 5.1, encoding, mạng, đường dẫn) | 8 | 002, 003, 009, 010, 013, 017, 018, 026 | Nhiều nhất. AI mặc định môi trường là bash/Linux/UTF-8/mạng tốt. Lỗi kiểu này không nằm trong code nên test không bắt được; phải đọc kỹ thông báo của shell và `git diff`. |
| Code mẫu trong slide có lỗi / anti-pattern | 5 | 014, 015, 021, 022, 023 | Slide minh hoạ ngắn gọn nên bỏ qua guard null, dùng `useState` sai chỗ, hardcode route, dùng effect để validate, đếm tick. Không chép nguyên văn mà đối chiếu với rule trong `project-rules.md`. |
| Sai phiên bản (`latest` ≠ phiên bản đề yêu cầu) | 3 | 001, 012, 020 | Lặp lại ở cả 3 HW. Bài học: luôn ghi rõ `pkg@^major` khi cài và kiểm tra bằng `npm ls` ngay sau đó. |
| A11y / UX | 3 | 007, 016, 025 | Label-in-name, Backspace điều hướng lùi, layout shift nuốt mất click. Cả ba đều pass test unit nhưng fail trên trình duyệt thật hoặc Lighthouse. |
| Lint / quy tắc React (Fast Refresh, purity, unused) | 3 | 004, 024, 028 | Bật oxlint với `react/exhaustive-deps: error` từ commit đầu giúp bắt lỗi sớm. |
| Performance (CLS, re-render thừa) | 2 (+015) | 008, 011 | Chỉ đo được trên bản build production bằng Lighthouse. Dev server không phản ánh đúng. |
| Hallucinated file / giả định sai về môi trường test | 2 | 005, 006 | Import một file chưa tạo; giả định jsdom không hỗ trợ `<dialog>`. Kiểm chứng bằng cách chạy thật thay vì tin vào trí nhớ. |
| Chính test viết sai | 2 | 027, 029 | Test cũng là code nên cũng có bug: quên chờ async, regex quá rộng. Khi test đỏ, cần xem lỗi nằm ở test hay ở code trước khi sửa. |
| Tài liệu / contract đặt sai chỗ | 1 | 019 | Nhờ review diff trước khi commit mà phát hiện được. |
| Hiển thị: CSS sai đơn vị, i18n | 2 | 030, 031 | Logic đúng và test xanh, nhưng UI sai. Chỉ phát hiện được khi **nhìn** vào ảnh chụp trình duyệt thật. |

### Cách kiểm chứng đã dùng (và nó bắt được gì)

1. **Test tự động (Vitest + Testing Library + supertest)**, tổng cộng 229 test cho 3 HW (HW1: 40; HW2: 20 + 75; HW3: 20 + 22 + 52). Bắt được logic sai, effect loop, tính trôi của đồng hồ (fake timer + `setSystemTime`), sự không khớp giữa client và server (test parity), và lỗi abort/unmount.
2. **Lint (oxlint, `exhaustive-deps: error`)**. Bắt được lỗi Fast Refresh, render không thuần (`Date.now()`), và biến không dùng.
3. **Lighthouse trên bản build production.** Bắt được CLS do scrollbar, CLS do skeleton sai kích thước, label-in-name, và thiếu `robots.txt`. HW1 đạt 100/100/100/100 ở cả 5 trang.
4. **E2E trên Chrome thật (puppeteer-core) + console DevTools.** Bắt được những gì jsdom không mô phỏng được: layout shift nuốt click (AI-025), pointer kéo thật, Backspace, reload giữ state, ẩn tab 150 giây. Console được kiểm tra sạch lỗi và warning sau mỗi lần chạy.
5. **Ảnh chụp minh chứng (`evidence/`).** Nhìn lại từng màn hình đã bắt được 2 lỗi hiển thị mà test, lint và E2E đều bỏ qua (AI-030, AI-031).
6. **`npm ls`, `git diff --cached`, đọc trực tiếp MongoDB.** Bắt được sai phiên bản, lỗi encoding trước khi push (AI-018 là bài học vì lỗi này đã lọt qua), và dữ liệu thật trong collection.

### Bài học

- **Contract trước, rồi mới viết code.** Khi rule nằm trong một hàm thuần dùng chung (`shared/appealRules.js`, `lib/score.js`, `lib/disproportionality.js`), mỗi rule chỉ cần test một lần, cả client và server cùng dùng, và không thể lệch nhau.
- **Derived state là mặc định.** Điểm số, deck còn lại, lỗi form, ma trận và thời gian còn lại đều tính được trong render. Chỉ dùng `useEffect` cho hệ thống bên ngoài: dialog, focus, fetch, timer, event listener. Mỗi effect đều có cleanup và AbortController.
- **Thời gian thì đọc từ đồng hồ tuyệt đối, không đếm tick.** Timer của trình duyệt không đáng tin khi tab bị ẩn.
- **jsdom không phải trình duyệt.** Các lỗi về layout, pointer và hiệu năng chỉ lộ ra trên Chrome thật hoặc Lighthouse. Vì vậy cuối mỗi HW đều có một vòng E2E thật.
- **Không tin `latest`, không tin môi trường mặc định.** Hãy pin phiên bản, dùng `127.0.0.1` thay cho `localhost`, dùng `--env-file` thay cho dotenv, và trên Windows thì chú ý encoding UTF-8 và chữ hoa/thường của ổ đĩa.
- **Ghi lại sự cố ngay khi gặp.** Audit viết trong cùng commit với bản sửa nên có commit hash thật và đủ chi tiết để người khác tái hiện được.
