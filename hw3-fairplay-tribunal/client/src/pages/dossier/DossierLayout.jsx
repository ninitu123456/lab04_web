import { PLAYER_IDS } from '@shared/appealRules.js';
import { Suspense } from 'react';
import { NavLink, Outlet, useParams } from 'react-router';
import LoadError from '../../components/LoadError.jsx';
import PageSkeleton from '../../components/PageSkeleton.jsx';
import { useDossier } from '../../hooks/useDossier.js';
import NotFoundPage from '../NotFoundPage.jsx';

const tabClass = ({ isActive }) => (isActive ? 'tab tab--active' : 'tab');

const TABS = [
  { to: '', label: 'Tổng quan & bằng chứng', end: true },
  { to: 'matrix', label: 'Ma trận tương xứng' },
  { to: 'appeal', label: 'Gửi kháng cáo' },
];

/**
 * /dossier/:playerId — MỘT route động (useParams), tab con qua NavLink + <Outlet />.
 * playerId không thuộc PLAYER_IDS (contract dùng chung) hoặc server trả 404 → 404 boundary.
 */
export default function DossierLayout() {
  const { playerId = '' } = useParams();
  const slug = playerId.toLowerCase();
  const isKnown = PLAYER_IDS.includes(slug);

  if (!isKnown) return <DossierNotFound playerId={playerId} />;
  return <KnownDossier playerId={slug} />;
}

/** Tách component để hook useDossier chỉ chạy khi slug hợp lệ (không fetch vô ích). */
function KnownDossier({ playerId }) {
  const { data: dossier, loading, error, notFound, retry } = useDossier(playerId);

  if (loading) return <PageSkeleton label="Đang tải hồ sơ…" />;
  if (notFound) return <DossierNotFound playerId={playerId} />;
  if (error) return <LoadError message={error} onRetry={retry} />;

  return (
    <article className="page dossier" aria-labelledby="dossier-title">
      <header className="dossier__header">
        <img src={dossier.avatar} alt="" width={112} height={112} className="dossier__avatar" />
        <div>
          <p className="eyebrow">Hồ sơ kỷ luật · Dữ liệu giả lập phục vụ bài tập</p>
          <h1 id="dossier-title">{dossier.displayName}</h1>
          <p className="dossier__meta">
            {dossier.team} · {dossier.role}
          </p>
        </div>
      </header>

      <nav aria-label={`Mục trong hồ sơ ${dossier.displayName}`} className="tabs">
        <ul className="tab-list">
          {TABS.map((tab) => (
            <li key={tab.label}>
              <NavLink to={tab.to} end={tab.end} className={tabClass}>
                {tab.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="dossier__panel">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet context={{ dossier }} />
        </Suspense>
      </div>
    </article>
  );
}

function DossierNotFound({ playerId }) {
  return (
    <NotFoundPage
      heading="Không tìm thấy hồ sơ"
      message={`Không có hồ sơ nào với mã "${playerId}". Các hồ sơ hiện có: ${PLAYER_IDS.join(', ')}.`}
    />
  );
}
