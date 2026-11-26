import { Link } from 'react-router';
import LoadError from '../components/LoadError.jsx';
import PageSkeleton from '../components/PageSkeleton.jsx';
import { useDossierList } from '../hooks/useDossier.js';
import { pageTitle } from '../lib/pageTitle.js';

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });

/** Cổng Tribunal — danh sách hồ sơ đang trong thời hạn kháng cáo. */
export default function PortalPage() {
  const { data, loading, error, retry } = useDossierList();

  return (
    <section className="page" aria-labelledby="portal-title">
      <title>{pageTitle('Cổng Tribunal')}</title>
      <h1 id="portal-title">Cổng kháng cáo Fair-Play</h1>
      <p className="lead">
        Xem hồ sơ kỷ luật, đối chiếu mức phạt với mức vi phạm và gửi kháng cáo trước khi hết hạn SLA.
      </p>
      <p className="disclaimer">Dữ liệu giả lập phục vụ bài tập.</p>

      {loading && <PageSkeleton label="Đang tải danh sách hồ sơ…" />}
      {error && <LoadError message={error} onRetry={retry} />}
      {data && (
        <ul className="dossier-list" aria-label="Danh sách hồ sơ">
          {data.map((d) => (
            <li key={d.playerId} className="dossier-card">
              <img src={d.avatar} alt="" width={96} height={96} className="dossier-card__avatar" />
              <div className="dossier-card__body">
                <h2 className="dossier-card__name">
                  <Link to={`/dossier/${d.playerId}`}>{d.displayName}</Link>
                </h2>
                <p className="dossier-card__meta">
                  {d.team} · {d.role} · {d.offenseCount} vi phạm
                </p>
                <p className="dossier-card__meta">
                  Hạn kháng cáo: <time dateTime={d.slaDeadline}>{dateFormatter.format(new Date(d.slaDeadline))}</time>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
