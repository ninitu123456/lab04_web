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

## HW2 Log

## HW3 Log