import { pageTitle } from '../../lib/pageTitle.js';
import { useDossierContext } from './useDossierContext.js';

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long', timeStyle: 'short' });

const EVIDENCE_KIND = { replay: 'Bản ghi trận', log: 'Nhật ký hệ thống', report: 'Biên bản', screenshot: 'Ảnh chụp' };

/** Tab mặc định: tóm tắt phán quyết + danh sách vi phạm & bằng chứng. */
export default function DossierOverview() {
  const { dossier } = useDossierContext();
  const totalBan = dossier.offenses.reduce((sum, o) => sum + o.penaltyMatches, 0);

  return (
    <section aria-labelledby="overview-title">
      <title>{pageTitle('Tổng quan', `Hồ sơ ${dossier.displayName}`)}</title>
      <h2 id="overview-title">Tổng quan phán quyết</h2>
      <p>{dossier.summary}</p>
      <dl className="meta-list">
        <dt>Ngày ra phán quyết</dt>
        <dd>
          <time dateTime={dossier.verdictAt}>{dateFormatter.format(new Date(dossier.verdictAt))}</time>
        </dd>
        <dt>Thời hạn kháng cáo</dt>
        <dd>
          {dossier.appealWindowHours} giờ — hết hạn{' '}
          <time dateTime={dossier.slaDeadline}>{dateFormatter.format(new Date(dossier.slaDeadline))}</time>
        </dd>
        <dt>Tổng mức phạt</dt>
        <dd>{totalBan} trận cấm thi đấu</dd>
      </dl>

      <h2>Vi phạm & bằng chứng</h2>
      <ol className="offense-list">
        {dossier.offenses.map((offense) => (
          <li key={offense.code} className="offense">
            <h3 className="offense__title">
              <span className="offense__code">{offense.code}</span> {offense.title}
            </h3>
            <p className="offense__meta">
              Mức độ {offense.severity}/5 · Phạt {offense.penaltyMatches} trận
            </p>
            <ul className="evidence-list" aria-label={`Bằng chứng cho ${offense.code}`}>
              {offense.evidence.map((ev) => (
                <li key={ev.ref}>
                  <span className="evidence__kind">{EVIDENCE_KIND[ev.kind] ?? ev.kind}:</span> {ev.label}{' '}
                  <code className="evidence__ref">{ev.ref}</code>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
