import { useAppealSlaTimer } from '../hooks/useAppealSlaTimer.js';

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long', timeStyle: 'medium' });
const pad = (n) => String(n).padStart(2, '0');

/** ISO 8601 duration cho <time dateTime>: P3DT4H5M6S */
const isoDuration = ({ days, hours, minutes, seconds }) => `P${days}DT${hours}H${minutes}M${seconds}S`;

/**
 * Đồng hồ SLA kháng cáo.
 * - Phần hiển thị cập nhật mỗi giây nhưng KHÔNG nằm trong live region.
 * - Live region (aria-live="polite") chỉ chứa chuỗi theo PHÚT → screen reader chỉ đọc khi đổi phút / khi hết hạn.
 * @param {{ deadline: string, offset: number, onResync?: () => void, synced?: boolean, syncError?: string | null }} props
 */
export default function SlaCountdown({ deadline, offset, onResync, synced = false, syncError = null }) {
  const time = useAppealSlaTimer(deadline, { offset, onResync });
  const { days, hours, minutes, seconds, isExpired } = time;

  const minuteAnnouncement = isExpired
    ? 'Đã hết hạn kháng cáo.'
    : `Còn ${days} ngày ${hours} giờ ${minutes} phút để kháng cáo.`;

  return (
    <section className={`sla ${isExpired ? 'sla--expired' : ''}`} aria-labelledby="sla-title">
      <h2 id="sla-title" className="sla__title">
        Hạn kháng cáo (SLA)
      </h2>
      {isExpired ? (
        <p className="sla__value sla__value--expired" data-testid="sla-value">
          <span aria-hidden="true">⛔ </span>Đã hết hạn kháng cáo
        </p>
      ) : (
        <p className="sla__value" data-testid="sla-value">
          Còn{' '}
          <time dateTime={isoDuration(time)}>
            {days} ngày {pad(hours)}:{pad(minutes)}:{pad(seconds)}
          </time>
        </p>
      )}
      <p className="sla__deadline">
        {/* Intl vi-VN (dateStyle + timeStyle) đã tự chèn chữ "lúc" → không viết thêm (AI-031). */}
        Thời điểm hết hạn: <time dateTime={deadline}>{dateFormatter.format(new Date(deadline))}</time>
      </p>
      <p className="sla__sync">
        {syncError
          ? `Chưa đồng bộ được với máy chủ (${syncError}) — đang dùng đồng hồ thiết bị.`
          : synced
            ? `Đã đồng bộ đồng hồ với máy chủ (lệch ${Math.round(offset)} ms).`
            : 'Đang đồng bộ đồng hồ với máy chủ…'}
      </p>
      <p className="visually-hidden" aria-live="polite" data-testid="sla-live">
        {minuteAnnouncement}
      </p>
    </section>
  );
}
