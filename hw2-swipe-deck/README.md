# HW2 — Full-Stack Interactive Card-Swipe Deck — "Hẹn Hò Nhưng Không Yêu" Edition

Lab 04 — UIT S3T.

- **Sinh viên:** Nguyễn Ngọc Thiên Tú — 24521911
- **Trường:** UIT — VNUHCM

Ứng dụng vuốt thẻ hồ sơ, điều khiển được bằng bàn phím, chuột/cảm ứng hoặc nút bấm. Undo theo kiểu stack LIFO, điểm bất đối xứng được tính trực tiếp từ lịch sử, và lịch sử vuốt được lưu vào MongoDB qua Express để reload trang không bị mất. Toàn bộ 12 hồ sơ là **nhân vật hư cấu**, avatar SVG được sinh offline bằng script.

**Stack:** React 19 + Vite 8 (client) · Express 5 + Mongoose 8 (server, ESM, async/await) · Vitest 5 + Testing Library + jsdom · supertest · mongodb-memory-server · oxlint.

## Cách chạy

Yêu cầu: Node ≥ 20.19 và MongoDB local đang chạy ở `127.0.0.1:27017`.

```bash
# 1) Server
cd server
npm install
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
npm run seed                # xoá rồi nạp lại 12 hồ sơ (idempotent) vào DB hw2
npm run dev                 # http://localhost:4000

# 2) Client (terminal khác)
cd client
npm install
npm run dev                 # http://localhost:5173 (proxy /api → :4000)
```

| Lệnh | Server | Client |
|---|---|---|
| `npm test` | 20 test (supertest + DB test) | 74 test (Testing Library + jsdom) |
| `npm run lint` | — | oxlint |
| `npm run build` | — | build production vào `dist/` |
| khác | `npm run seed`, `npm start` | `npm run gen:avatars` (sinh lại SVG trong `public/avatars/`) |

`.env` (không được commit) gồm `PORT`, `CLIENT_ORIGIN`, `MONGODB_URI=mongodb://127.0.0.1:27017/hw2`. Dùng `127.0.0.1` chứ không dùng `localhost`, vì Node ≥ 18 có thể phân giải `localhost` thành `::1` (IPv6), trong khi mongod chỉ nghe IPv4, dẫn tới lỗi `ECONNREFUSED`.

**DB cho test API.** Test không bao giờ dùng `MONGODB_URI`. Mặc định test chạy trên `mongodb-memory-server`. Nếu máy không tải được binary mongod (máy làm bài gặp đúng trường hợp này, xem AI-017), hãy đặt `MONGODB_URI_TEST=mongodb://127.0.0.1:27017/hw2_test` trong `.env`; `vitest.config.js` sẽ đọc biến này. Có thêm một chốt an toàn: test từ chối chạy nếu tên DB không kết thúc bằng `_test`, vì sau khi chạy xong test sẽ `dropDatabase()`.

> Windows: hãy chạy `npm test` từ đường dẫn có ổ đĩa viết hoa (`C:\...`), xem AI-010.

## Đối chiếu yêu cầu của thầy

| # | Yêu cầu (slide 20, 31, 32) | Hiện thực | Test chứng minh |
|---|---|---|---|
| 1 | **Dual Keyboard/Pointer listener.** ← NOPE, → LIKE, ↑ SUPER, Backspace undo. Kéo \|dx\| > 50px trái/phải, dy < −50px lên | `client/src/lib/deck.js` (`directionFromKey`, `directionFromDelta`), `client/src/components/SwipeDeck.jsx` (vùng deck `tabIndex={0}`, `onKeyDown`, `onPointerDown/Move/Up/Cancel`, `setPointerCapture`) | `lib/deck.test.js`, `components/SwipeDeck.test.jsx` (phím, nút, kéo > 50px, kéo < 50px, pointerup khi chưa có pointerdown), `components/SwipeDeckUndo.test.jsx` (Backspace + `preventDefault`, bỏ qua trong input) |
| 2 | **LIFO Undo Stack.** `history` là stack, undo = pop, thẻ quay lại đầu deck | `client/src/hooks/useSwipeDeck.js` (`useReducer`: `swipe` push, `undo` pop) | `hooks/useSwipeDeck.test.js`, `App.test.jsx` (vuốt 3 lần, Backspace 2 lần, thẻ quay lại theo thứ tự ngược) |
| 3 | **Asymmetric Score.** Tính thuần từ `history` bằng `reduce` trong render, không dùng useState/useEffect | `client/src/lib/score.js` (`SCORE_WEIGHTS`, `computeScore`, `computeStats`), gọi trong render ở `useSwipeDeck` | `lib/score.test.js` (lịch sử rỗng = 0, chỉ NOPE thì âm, hỗn hợp), `App.test.jsx` |
| 4 | **Full-Stack Persistence.** Express + Mongoose 8 async/await, `process.env.MONGODB_URI` (throw nếu thiếu), không dùng `useNewUrlParser`/`useUnifiedTopology`, `GET /api/profiles` dùng `.lean()`, `POST /api/swipe` có try/catch trả 400 | `server/src/config.js`, `server/src/db.js`, `server/src/models/*.js`, `server/src/routes/*.js`; client: `hooks/useProfiles.js`, `hooks/useSwipeApi.js` | `server/src/app.test.js`, `server/src/routes/api.test.js`, `hooks/useProfiles.test.js`, `hooks/useSwipeApi.test.js` |

**Trọng số điểm.** `SCORE_WEIGHTS = { LIKE: +10, NOPE: −5, SUPER: +20 }`.

- Contract của slide là LIKE +10, mọi hướng còn lại −5. Hướng nào không có trong bảng sẽ bị tính −5 theo đúng contract này.
- **SUPER +20 là phần mở rộng do sinh viên thêm**, không có trong slide. Điều này cũng được ghi trong JSDoc của `score.js`.

**Hai lỗi của slide 31 đã được sửa** (xem AI-014, AI-015):

- **(a)** `handlePointerUp` đọc `startPos.x` trong khi `startPos` có thể đang null. Đã sửa bằng guard null, đồng thời kiểm tra `pointerId` có khớp không.
- **(b)** `useState` cho `startPos` khiến component re-render mỗi lần chạm. Đã chuyển sang `useRef`. Hiệu ứng kéo được cập nhật qua CSS variable nên cũng không gây re-render.

## REST API

| Method | Path | Body / Query | Thành công | Lỗi |
|---|---|---|---|---|
| GET | `/api/health` | — | 200 `{ status: 'ok', time }` | — |
| GET | `/api/profiles` | — | 200 `Profile[]` (`.lean()`, sắp theo `createdAt`) | 500 |
| POST | `/api/swipe` | `{ sessionId, profileId, direction }` | 201 `Swipe` | 400 `{ error }`: thiếu field, `direction` ∉ {LIKE, NOPE, SUPER}, `profileId` không phải ObjectId, profile không tồn tại, JSON hỏng |
| GET | `/api/swipes` | `?sessionId=…` | 200 `Swipe[]` của phiên, cũ → mới | 400 khi thiếu `sessionId` |
| DELETE | `/api/swipe/:id` | — | 204 | 404 khi id sai định dạng hoặc không tồn tại |
| * | `/api/*` khác | — | — | 404 `{ error: 'Not found' }` |

Model:

- `Profile { name, age (18–99), bio, interests: [String], avatar, timestamps }`
- `Swipe { sessionId (index), profileId (ref Profile), direction (enum), timestamps }`

`npm run seed` xoá profiles cũ rồi `insertMany` lại. Script cũng xoá luôn swipes cũ, vì chúng trỏ tới `_id` của profiles đã bị xoá.

## Kiến trúc state (client)

```
useProfiles()      GET /api/profiles (AbortController)  → profiles, loading, error, retry
useSwipeDeck(p)    useReducer — STATE DUY NHẤT: history (LIFO stack)
                   derived trong render: remaining = profiles − history, current = remaining[0],
                                         score = computeScore(history), stats = computeStats(history)
useSwipeApi(deck)  sessionId (localStorage), khôi phục history qua GET /api/swipes,
                   swipe → optimistic push + POST (lỗi → remove + role="alert"),
                   undo  → optimistic pop  + DELETE (lỗi → reinsert + role="alert")
App                ghép 3 hook; SwipeDeck / ScoreBoard / DeckSummary chỉ hiển thị
```

- **`history` là nguồn sự thật.** Điểm, thống kê, thẻ hiện tại và số thẻ còn lại đều không nằm trong state riêng. `lastEvent` trong reducer chỉ dùng để soạn câu thông báo cho `aria-live`.
- **`useEffect` chỉ dùng để đồng bộ với hệ thống bên ngoài**, tức là các lời gọi fetch. Mỗi effect có `AbortController`, và chỉ setState khi `!signal.aborted`. Không dùng cờ `didCancel`.
- Nếu bạn bấm undo khi POST của lượt vuốt đó chưa xong, DELETE sẽ chờ POST trả về `_id` rồi mới gửi. Mọi promise đều có `.catch`, nên không có unhandled rejection.
- Không dùng `defaultProps`. Giá trị mặc định của prop đều viết bằng default parameter.

## Phím tắt & accessibility

| Thao tác | Bàn phím (khi vùng deck đang focus) | Pointer | Nút |
|---|---|---|---|
| Bỏ qua (NOPE, −5) | ← | kéo trái > 50px | ✕ Bỏ qua |
| Thích (LIKE, +10) | → | kéo phải > 50px | ♥ Thích |
| Siêu thích (SUPER, +20) | ↑ | kéo lên > 50px | ★ Siêu thích |
| Hoàn tác | Backspace (`preventDefault`, bỏ qua khi đang trong input/textarea) | — | ↺ Hoàn tác (disabled khi stack rỗng) |

- **Thông báo động:** mỗi lần vuốt hoặc undo được đọc qua `aria-live="polite"`, kèm điểm hiện tại. Lỗi tải dữ liệu hoặc lỗi đồng bộ hiện bằng `role="alert"`, có nút Thử lại hoặc nút Đóng.
- **Trạng thái tải:** skeleton có `role="status"` và `aria-busy="true"`.
- **Cấu trúc thẻ:** dùng `<article>`, ảnh có `alt`, thông tin tuổi và sở thích nằm trong `<dl>`.
- **Nút bấm:** đều có `aria-label` chứa nhãn hiển thị (label-in-name), vùng bấm ≥ 44px, và bị disabled khi không thao tác được.
- **Hình ảnh và chuyển động:** contrast ≥ 4.5:1, có `:focus-visible`; khi người dùng bật `prefers-reduced-motion` thì toàn bộ animation bị tắt.

## Kiểm thử end-to-end (đã chạy thật)

Đã chạy `npm run seed`, sau đó chạy cả server và client dev. Kịch bản được chạy trong Chrome thật (headless, qua puppeteer-core):

- → ← ↑ cho điểm 10, 5, 25.
- Kéo chuột +120px là LIKE; kéo −30px bị bỏ qua; kéo lên 100px là SUPER.
- Backspace 2 lần: thẻ quay lại theo thứ tự ngược, URL không đổi.
- Bấm nút Bỏ qua hoạt động.
- Reload trang vẫn giữ nguyên thẻ hiện tại, điểm, và nút Hoàn tác vẫn bật.
- Console không có lỗi hay warning nào.

Đọc trực tiếp DB `hw2` (chính là dữ liệu Compass hiển thị) thấy collection `profiles` có 12 document và `swipes` có lịch sử theo `sessionId`.

## Commit HW2

```
48cca61 init: scaffold hw2 client + express/mongoose 8 server
1cc24e7 feat: profile & swipe models with async/await REST API
fe87557 feat: swipe deck with dual keyboard/pointer listeners
f00bdd5 feat: lifo undo stack and asymmetric derived score
        feat: persist swipes via useSwipeApi hook with AbortController + docs
```

Xem thêm: [`../project-rules.md`](../project-rules.md) · [`../TASK_DECOMPOSITION.md`](../TASK_DECOMPOSITION.md) · [`../AI_FAILURE_AUDIT.md`](../AI_FAILURE_AUDIT.md)
