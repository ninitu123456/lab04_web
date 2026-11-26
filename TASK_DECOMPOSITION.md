# Task Decomposition (WBS) — Lab 04

## HW1 — Production Multi-Route Photo & Evidence Gallery SPA
**Spec:** deep linking bằng `useSearchParams` (category + photoId), lightbox bằng `<dialog>` gốc, WCAG 2.2 AA, Lighthouse 100/100.

| # | Stage | Commit | Status |
|---|---|---|---|
| 1 | Contract | docs: define contract spec in project-rules.md | [x] |
| 2 | Setup | init: scaffold hw1 photo gallery with vite + react 19 | [x] |
| 3 | Setup | chore: add react-router v7 and vitest testing setup | [x] |
| 4 | Contract | feat: add photo data contract and category model | [x] |
| 5 | Fail Test | test: add failing test for url-driven category filter | [x] |
| 6 | Implement | feat: add react router v7 layout with outlet and navlink | [x] |
| 7 | Implement | feat: implement category filter via useSearchParams | [x] |
| 8 | Fail Test | test: add failing test for photoId lightbox deep link | [x] |
| 9 | Implement | feat: native html dialog lightbox synced to url | [x] |
| 10 | Implement | feat: keyboard prev/next navigation and focus return | [x] |
| 11 | Refactor | perf: route-level code splitting with lazy and suspense skeleton | [x] |
| 12 | Implement | feat: 404 route and invalid photoId boundary | [x] |
| 13 | Refactor | a11y: skip link, focus-visible, aria labels, contrast | [x] |
| 14 | Refactor | perf: responsive images, explicit dimensions, lighthouse tuning | [x] |
| 15 | Docs | docs: hw1 readme, lighthouse report and ai failure audit | [x] |

## HW2 — Full-Stack Card-Swipe Deck ("Hẹn Hò Nhưng Không Yêu")
**Spec:** dual keyboard/pointer listener, LIFO undo stack, asymmetric derived score, Express + Mongoose 8 async/await.

| # | Commit | Status |
|---|---|---|
| 1 | init: scaffold hw2 client + express/mongoose 8 server | [x] |
| 2 | feat: profile & swipe models with async/await REST API | [x] |
| 3 | feat: swipe deck with dual keyboard/pointer listeners | [x] |
| 4 | feat: lifo undo stack and asymmetric derived score | [x] |
| 5 | feat: persist swipes via useSwipeApi hook with AbortController + docs | [x] |

## HW3 — Full-Stack Esports Fair-Play Appeal Tribunal (Himass & TanVuu)
**Spec:** route động `/dossier/:playerId` (useParams), appeal form engine điều khiển bằng Context + validate đồng bộ trong render, zero-drift SLA countdown (đồng hồ tuyệt đối + resync khi `visibilitychange`), disproportionality matrix (useMemo), client/server validation parity (`shared/`).

| # | Commit | Status |
|---|---|---|
| 1 | init: scaffold hw3 client, server and shared validation contract | [x] |
| 2 | feat: dossier & appeal models, rest api with shared validation parity | [x] |
| 3 | feat: multi-route dossier navigation with derived disproportionality matrix | [x] |
| 4 | feat: context-driven appeal form engine with real-time validation | [x] |
| 5 | feat: zero-drift useAppealSlaTimer with visibilitychange resync + post-mortem docs | [ ] |
