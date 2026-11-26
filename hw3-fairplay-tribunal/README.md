# HW3 — Full-Stack Esports Fair-Play Appeal Tribunal — Himass & TanVuu Case Study

Lab 04 — UIT S3T.

- **Sinh viên:** Nguyễn Ngọc Thiên Tú — 24521911
- **Trường:** UIT — VNUHCM

> **Dữ liệu giả lập phục vụ bài tập.** Mọi vi phạm, hình phạt, đội tuyển và bằng chứng trong ứng dụng đều là hư cấu. Chúng không phản ánh, cũng không khẳng định hành vi có thật của bất kỳ người thật nào. Tên hồ sơ "Himass" và "TanVuu" lấy theo case study trong slide môn học. Avatar là SVG tự vẽ, ứng dụng không gọi mạng ngoài. Dòng ghi chú này cũng hiện trên UI, ở footer, cổng Tribunal và đầu mỗi hồ sơ.

Đây là cổng kháng cáo kỷ luật esports:

- Mỗi hồ sơ có một route động riêng. Trang hồ sơ có ma trận so sánh mức phạt với mức vi phạm, và biểu mẫu kháng cáo validate theo thời gian thực.
- Rule validate dùng **chung** giữa client và server, nên hai bên luôn cho kết quả giống nhau.
- Đồng hồ hạn kháng cáo (SLA) không bị trôi (zero-drift), kể cả khi tab bị ẩn lâu.

**Stack:** React 19 + Vite 8 + React Router **v7** (client) · Express 5 + Mongoose **8** (server, ESM, async/await) · `shared/` (rule validate dùng chung, ESM thuần) · Vitest 5 + Testing Library + jsdom · supertest · mongodb-memory-server · oxlint (`react/exhaustive-deps: error`).

## Cách chạy

Yêu cầu: Node ≥ 20.19 và MongoDB local đang chạy ở `127.0.0.1:27017`. Dùng `127.0.0.1` chứ không dùng `localhost`, xem AI-013.

```bash
# 1) Server — cổng 4001, DB hw3
cd server
npm install
cp .env.example .env        # PowerShell: Copy-Item .env.example .env
npm run seed                # nạp 2 hồ sơ giả lập (idempotent); SLA còn hạn ~4–5 ngày kể từ lúc seed
npm run dev                 # http://localhost:4001

# 2) Client — cổng 5174, proxy /api → 4001 (terminal khác)
cd client
npm install
npm run dev                 # http://localhost:5174
```

HW3 dùng cổng 5174/4001, khác với HW2 (5173/4000), nên hai bài chạy song song được mà không đụng nhau.

| Lệnh | `shared/` | `server/` | `client/` |
|---|---|---|---|
| `npm test` | 20 test | 22 test | 52 test |
| `npm run lint` / `npm run build` | — | — | oxlint (0 cảnh báo) / build production |
| khác | — | `npm run seed`, `npm start` | `npm run preview` |

**Biến môi trường.** `.env` không được commit, có `.env.example` để copy. Gồm `PORT=4001`, `CLIENT_ORIGIN=http://localhost:5174`, `MONGODB_URI=mongodb://127.0.0.1:27017/hw3`, và tuỳ chọn `MONGODB_URI_TEST`.

- `loadConfig()` sẽ throw nếu thiếu `MONGODB_URI`.
- Test API mặc định chạy trên `mongodb-memory-server`. Nếu máy không tải được binary mongod (xem AI-017), test dùng DB `hw3_test` qua `MONGODB_URI_TEST`.
- Test chỉ chạy khi tên DB kết thúc bằng `_test`, nên không thể đụng vào DB `hw3` thật.

> Windows: hãy chạy `npm test` từ đường dẫn có ổ đĩa viết hoa (`C:\...`), xem AI-010.

## Sơ đồ route

Một mảng `routes` (`client/src/routes.jsx`) dùng chung cho `createBrowserRouter` (app thật) và `createMemoryRouter` (test).

```
/                              RootLayout ─ PortalPage                 danh sách hồ sơ
/dossier/:playerId             RootLayout ─ DossierLayout (lazy)       useParams + NavLink tab + <Outlet />
    (index)                                 └ DossierOverview (lazy)    tổng quan + bằng chứng
    matrix                                  └ DossierMatrix (lazy)      ma trận tương xứng (useMemo)
    appeal                                  └ DossierAppeal (lazy)      form kháng cáo + chặn khi hết SLA
*                              RootLayout ─ NotFoundPage                404
errorElement                   RouteErrorPage
```

- Đề dùng **một route động** `/dossier/:playerId` (slide 21) thay cho hai route cứng `/dossier/himass` và `/dossier/tanvuu` của slide 33 (xem AI-021).
- **404 boundary** xảy ra trong hai trường hợp:
  - `playerId` không thuộc `PLAYER_IDS` của contract chung. Khi đó client không gọi API.
  - Server trả 404 cho `playerId` đó.

  Cả hai đều hiện trang "Không tìm thấy hồ sơ".
- **Accessibility:**
  - Mỗi route có `<title>` riêng (React 19), có skip link, và focus chuyển về `<main>` khi đổi trang. Khi chỉ đổi tab trong cùng hồ sơ thì focus vẫn ở thanh tab.
  - Tab đang chọn có `aria-current="page"`.
  - Trong lúc lazy chunk đang tải, hiện skeleton có `aria-busy`.

## REST API

| Method | Path | Body / Query | Thành công | Lỗi |
|---|---|---|---|---|
| GET | `/api/health` | — | 200 `{ status, time }` | — |
| GET | `/api/dossiers` | — | 200 danh sách tóm tắt (`offenseCount`, `slaDeadline`) | 500 |
| GET | `/api/dossiers/:playerId` | — | 200 hồ sơ đầy đủ + `slaDeadline` (ISO) = `verdictAt + appealWindowHours` | 404 `{ error }` |
| GET | `/api/time` | — | 200 `{ now: <epoch ms> }`, `Cache-Control: no-store` | — |
| POST | `/api/appeals` | `AppealInput` | 201 bản ghi (`status: 'pending'`, không lưu `confirmEmail`/`acceptTerms`) | 400 `{ errors: { field: message } }` (kết quả của **chính** `validateAppeal`); 404 khi hồ sơ không có trong DB; 409 khi đã quá hạn SLA |
| GET | `/api/appeals` | `?playerId=` | 200 kháng cáo của hồ sơ, mới nhất trước (ẩn email) | 400 khi thiếu hoặc sai `playerId` |

Mọi handler đều dùng async/await. Các truy vấn đọc dùng `.lean()`. `POST /api/appeals` có try/catch: lỗi validate trả 400, lỗi hệ thống chuyển cho error handler tập trung trả 500. Không có callback Mongoose nào.

**Model:**

- `Dossier { playerId (unique, enum), displayName, team, role, summary, avatar, offenses[{ code, title, severity 1–5, penaltyMatches, evidence[{ kind, label, ref }] }], verdictAt, appealWindowHours }`
- `Appeal { playerId, appellantName, email, reason, statement, evidenceUrl?, status, timestamps }`

Schema `Appeal` dùng chung hằng số (`LIMITS`, `APPEAL_REASONS`, `PLAYER_IDS`) với `shared/`.

## Đối chiếu yêu cầu của thầy

| # | Yêu cầu (slide 21, 33, Sprint 2: slide 14, 15, 24, 25) | Hiện thực | Test chứng minh |
|---|---|---|---|
| 1 | **Multi-Route Dossier Navigation.** Route động `/dossier/:playerId` (`useParams`), có hồ sơ Himass và TanVuu, id không tồn tại thì vào 404 boundary | `client/src/routes.jsx`, `pages/dossier/DossierLayout.jsx`, `hooks/useApiResource.js` + `useDossier.js` (AbortController, guard `signal.aborted`) | `client/src/App.test.jsx` (deep link `/dossier/tanvuu/matrix`, `/dossier/khong-co` vào 404 mà không fetch, NavLink `aria-current`, focus `<main>`), `hooks/useApiResource.test.js` |
| 2 | **Appeal Form Engine.** `FormContext` + `useFormContext`; `errors = validateAppeal(values)` tính trong render, không dùng useEffect; `InputField` dùng `useId`, `label htmlFor`, `aria-invalid`, `aria-describedby` trỏ tới lỗi `role="alert"`; submit hợp lệ thì hiện `<ShowData />` dạng `<dl>` | `client/src/features/appeal/FormContext.js`, `AppealForm.jsx`, `fields.jsx` (`InputField`, `SelectField`, `TextareaField`, `CheckboxField`), `ShowData.jsx`; `hooks/useAppealSubmit.js` | `features/appeal/AppealForm.test.jsx`: lỗi hiện sau blur; lỗi cross-field `confirmEmail`; submit rỗng thì focus field đầu, hiện tóm tắt, không fetch; payload hợp lệ thì POST đúng body và hiện ShowData `<dl>`; server 400 thì lỗi hiện đúng field; test **đọc source** để khẳng định engine không gọi `useEffect` |
| 3 | **Zero-Drift SLA Countdown.** `useAppealSlaTimer(deadline)` tính từ đồng hồ tuyệt đối, không cộng dồn tick; `visibilitychange` thì resync; có cleanup | `client/src/hooks/useAppealSlaTimer.js`, `hooks/useServerClockOffset.js`, `components/SlaCountdown.jsx` | `hooks/useAppealSlaTimer.test.js` (fake timers: (a) nhảy đồng hồ 10 phút nhưng chỉ có 1 tick thì remaining giảm đúng 10 phút; (b) tab visible thì resync; (c) unmount thì `getTimerCount() = 0` và listener bị gỡ; (d) quá deadline thì `isExpired`, remaining = 0), `hooks/useServerClockOffset.test.js`, `components/SlaCountdown.test.jsx` (hết hạn thì chặn submit; server 409) |
| 4 | **Disproportionality Derived Matrix.** Tính bằng `useMemo` từ dossier | `client/src/lib/disproportionality.js` (hàm thuần), `components/DisproportionalityMatrix.jsx` (`useMemo`, `<table>` có `<caption>`, `<th scope>`, biểu tượng + chữ chứ không chỉ dùng màu) | `lib/disproportionality.test.js`, `App.test.jsx` (deep link `/dossier/himass/matrix`) |
| 5 | **Post-Mortem Audit** | [`../AI_FAILURE_AUDIT.md`](../AI_FAILURE_AUDIT.md), gồm mục "HW3 Log" (AI-020 đến AI-029) và mục "Post-Mortem" | — |
| + | **Client & server validation parity** (manifesto slide 3) | `shared/appealRules.js` được import bởi cả `client` (alias `@shared`) lẫn `server/src/routes/appeals.js` | `shared/appealRules.test.js` (20 test); `server/src/routes/api.test.js`: 6 payload lỗi, server trả **đúng** `{ errors: validateAppeal(payload) }` |

## Validation parity

`shared/appealRules.js` là contract JSDoc (`AppealInput`) đi kèm một hàm thuần `validateAppeal(values)`. Hàm trả về `{ field: message }`; nếu trả `{}` nghĩa là dữ liệu hợp lệ.

Các rule:

- `playerId` thuộc `PLAYER_IDS`.
- `appellantName` dài 2–60 ký tự.
- `email` đúng định dạng.
- `confirmEmail` phải khớp với `email` (cross-field).
- `reason` thuộc enum 4 giá trị.
- `statement` dài 50–2000 ký tự.
- `evidenceUrl` là tuỳ chọn; nếu có thì phải là URL http/https.
- `acceptTerms` phải `=== true`.

Hai bên dùng hàm này như sau:

- **Client** gọi hàm trong mỗi render để hiện lỗi ngay lập tức.
- **Server** gọi đúng hàm đó cho `req.body`.

Vì vậy hai bên không thể lệch nhau. Test parity gửi payload lỗi lên server, rồi so sánh nguyên văn phản hồi với kết quả `validateAppeal` chạy ở phía test.

Những gì `shared/` cố tình *không* làm:

- **Không kiểm tra hạn SLA.** Việc này cần đồng hồ server, nên server trả 409, còn client chặn sớm bằng `useAppealSlaTimer`.
- **Không kiểm tra hồ sơ có trong DB hay không.** Server trả 404 cho trường hợp này.

## Zero-drift: tại sao không dùng `remaining -= 1000`

```js
// SAI — đếm tick: setInterval của tab ẩn bị trình duyệt throttle (≥ 1s, có khi ~1 phút)
setRemaining((r) => r - 1000);

// ĐÚNG — đọc lại đồng hồ tuyệt đối mỗi tick (useAppealSlaTimer)
const [now, setNow] = useState(() => Date.now());
setInterval(() => setNow(Date.now()), tickMs);        // tick CHỈ để kích hoạt render
const remainingMs = Math.max(0, deadline - (now + offset));
```

**Vì sao cách đúng không bị trôi:**

- Tick trễ hoặc bị bỏ qua chỉ làm UI cập nhật trễ một chút, còn con số hiển thị vẫn đúng.
- Lỗi lệch cũng không dồn lên theo thời gian.
- Khi hết hạn, interval tự dừng.

**Offset giữa đồng hồ thiết bị và server:** offset = `serverNow − (t0 + t1)/2` (lấy từ `GET /api/time`). Lấy điểm giữa giữa lúc gửi request (t0) và lúc nhận phản hồi (t1) là để bù độ trễ mạng.

**Khi tab ẩn rồi hiện lại** (`visibilitychange` → `visible`), hook làm hai việc:

- gọi `resync()` để lấy lại offset,
- đọc lại đồng hồ ngay, không chờ tick kế tiếp.

**Accessibility:**

- Phần hiển thị có `<time dateTime="P4DT23H54M11S">` và cập nhật mỗi giây, nhưng không nằm trong live region.
- Live region `aria-live="polite"` chỉ chứa chuỗi tính theo phút, nên screen reader chỉ đọc khi đổi phút hoặc khi hết hạn.

## Kiểm thử end-to-end (đã chạy thật, Chrome headless qua puppeteer-core)

Đã chạy `npm run seed`, sau đó chạy cả server :4001 và client :5174 dev:

- `/`: thấy 2 thẻ hồ sơ; `<title>` là "Cổng Tribunal · Fair-Play Appeal Tribunal".
- `/dossier/himass`: tổng quan, bằng chứng và SLA hiện đúng. Đồng hồ báo "Đã đồng bộ đồng hồ với máy chủ (lệch 2 ms)".
- `/dossier/tanvuu/matrix` (deep link): TV-01 tỉ lệ 1,25 "● Tương xứng"; TV-02 tỉ lệ 2,00 "▲ Không tương xứng"; TV-03 tỉ lệ 1,00. Tab "Ma trận" có `aria-current`.
- `/dossier/khong-co`: hiện trang "Không tìm thấy hồ sơ".
- **Kháng cáo lỗi:** gõ email sai, confirmEmail lệch, rồi bấm Gửi ngay. Kết quả: tóm tắt "Có 6 lỗi cần sửa", 6 field bị `aria-invalid`, focus vào ô họ tên.
  - Ở lần chạy đầu, cú bấm này bị "nuốt" mất, form không submit. Đã sửa (xem AI-025).
  - Ngoài ra, gửi thẳng một payload lỗi lên `POST /api/appeals` thì server trả 400 kèm đủ 7 lỗi tiếng Việt, giống hệt kết quả ở client.
- **Kháng cáo hợp lệ:** POST trả 201, ShowData hiện dạng `<dl>` và focus nằm ở tiêu đề "Đã gửi kháng cáo thành công". Đọc trực tiếp DB `hw3` (dữ liệu Compass hiển thị) thấy collection `appeals` có bản ghi `status: 'pending'`, không có `confirmEmail`/`acceptTerms`.
- **Ẩn tab 150 giây** (mở tab khác bằng `bringToFront`, trình duyệt phát sự kiện `hidden` rồi `visible`):
  - Khi quay lại, trình duyệt gọi lại `/api/time` để resync.
  - Thời gian còn lại hiển thị lệch **15 ms** so với `deadline − server now`.
- Console không có lỗi hay warning nào.

Ảnh chụp minh chứng: [`../evidence/hw3/`](../evidence/hw3/).

## Commit HW3

```
7ef505c init: scaffold hw3 client, server and shared validation contract
f71922c feat: dossier & appeal models, rest api with shared validation parity
dc95bfb feat: multi-route dossier navigation with derived disproportionality matrix
9960669 feat: context-driven appeal form engine with real-time validation
        feat: zero-drift useAppealSlaTimer with visibilitychange resync + post-mortem docs
```

Xem thêm: [`../project-rules.md`](../project-rules.md) · [`../TASK_DECOMPOSITION.md`](../TASK_DECOMPOSITION.md) · [`../AI_FAILURE_AUDIT.md`](../AI_FAILURE_AUDIT.md)
