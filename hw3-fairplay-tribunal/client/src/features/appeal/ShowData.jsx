import { APPEAL_REASONS } from '@shared/appealRules.js';
import { useCallback } from 'react';

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long', timeStyle: 'medium' });
const STATUS_LABEL = { pending: 'Đang chờ xử lý', accepted: 'Được chấp nhận', rejected: 'Bị bác' };

/**
 * Hiển thị bản ghi kháng cáo đã lưu dưới dạng <dl>/<dt>/<dd> (không JSON.stringify).
 * @param {{ data: {
 *   _id?: string, playerId: string, appellantName: string, email?: string, reason: string,
 *   statement: string, evidenceUrl?: string, status?: string, createdAt?: string,
 * }, playerName?: string, onReset?: () => void }} props
 */
export default function ShowData({ data, playerName, onReset }) {
  // Đưa focus tới tiêu đề kết quả khi vừa hiện (ref callback ổn định → chỉ chạy lúc mount).
  const focusOnMount = useCallback((el) => el?.focus(), []);
  const reason = APPEAL_REASONS.find((r) => r.value === data.reason)?.label ?? data.reason;

  return (
    <section className="show-data" aria-labelledby="show-data-title">
      <h3 id="show-data-title" ref={focusOnMount} tabIndex={-1}>
        <span aria-hidden="true">✓ </span>Đã gửi kháng cáo thành công
      </h3>
      <dl className="meta-list">
        {data._id && (
          <>
            <dt>Mã kháng cáo</dt>
            <dd>
              <code>{data._id}</code>
            </dd>
          </>
        )}
        <dt>Hồ sơ</dt>
        <dd>{playerName ?? data.playerId}</dd>
        <dt>Người kháng cáo</dt>
        <dd>{data.appellantName}</dd>
        {data.email && (
          <>
            <dt>Email liên hệ</dt>
            <dd>{data.email}</dd>
          </>
        )}
        <dt>Lý do</dt>
        <dd>{reason}</dd>
        <dt>Nội dung</dt>
        <dd className="show-data__statement">{data.statement}</dd>
        <dt>Liên kết bằng chứng</dt>
        <dd>{data.evidenceUrl ? <a href={data.evidenceUrl} rel="noreferrer noopener" target="_blank">{data.evidenceUrl}</a> : 'Không có'}</dd>
        <dt>Trạng thái</dt>
        <dd>{STATUS_LABEL[data.status] ?? data.status ?? '—'}</dd>
        {data.createdAt && (
          <>
            <dt>Thời điểm gửi</dt>
            <dd>
              <time dateTime={data.createdAt}>{dateFormatter.format(new Date(data.createdAt))}</time>
            </dd>
          </>
        )}
      </dl>
      {onReset && (
        <button type="button" className="button button--secondary" onClick={onReset}>
          Gửi kháng cáo khác
        </button>
      )}
    </section>
  );
}
