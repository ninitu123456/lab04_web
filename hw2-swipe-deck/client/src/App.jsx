import DeckSummary from './components/DeckSummary.jsx';
import ScoreBoard from './components/ScoreBoard.jsx';
import SwipeDeck from './components/SwipeDeck.jsx';
import { useProfiles } from './hooks/useProfiles.js';
import { useSwipeApi } from './hooks/useSwipeApi.js';
import { useSwipeDeck } from './hooks/useSwipeDeck.js';
import { DIRECTION_LABELS } from './lib/deck.js';

/**
 * Soạn câu thông báo cho aria-live từ sự kiện cuối + điểm hiện tại (derived).
 * @param {import('./hooks/useSwipeDeck.js').LastEvent} lastEvent
 * @param {readonly import('./lib/deck.js').Profile[]} profiles
 * @param {number} score
 */
function describeEvent(lastEvent, profiles, score) {
  if (!lastEvent) return '';
  const name = profiles.find((p) => p._id === lastEvent.entry.profileId)?.name ?? 'hồ sơ';
  const action =
    lastEvent.type === 'undo'
      ? `Đã hoàn tác: ${name} quay lại đầu bộ thẻ.`
      : `${DIRECTION_LABELS[lastEvent.entry.direction]}: ${name}.`;
  return `${action} Điểm hiện tại: ${score}.`;
}

function DeckSkeleton() {
  return (
    <div className="deck-skeleton" role="status" aria-busy="true" aria-live="polite">
      <span className="visually-hidden">Đang tải hồ sơ…</span>
      <div className="deck-skeleton__card" aria-hidden="true" />
    </div>
  );
}

export default function App() {
  const { profiles, loading, error, retry } = useProfiles();
  const deck = useSwipeDeck(profiles);
  const api = useSwipeApi(deck, { profiles, enabled: !loading && !error });

  let content;
  if (error) {
    content = (
      <div className="load-error" role="alert">
        <p>Không tải được danh sách hồ sơ ({error}).</p>
        <button type="button" className="action action--undo" onClick={retry}>
          Thử lại
        </button>
      </div>
    );
  } else if (loading || api.restoring) {
    content = <DeckSkeleton />;
  } else {
    content = (
      <>
        <ScoreBoard score={deck.score} stats={deck.stats} />
        <SwipeDeck
          profile={deck.current}
          remaining={deck.remaining.length}
          onSwipe={api.swipe}
          onUndo={api.undo}
          canUndo={deck.canUndo}
          emptyState={<DeckSummary total={profiles.length} score={deck.score} stats={deck.stats} />}
        />
      </>
    );
  }

  return (
    <main className="app">
      <header className="app__header">
        <h1>Hẹn Hò Nhưng Không Yêu</h1>
        <p className="app__tagline">Vuốt cho vui — không ai yêu ai cả.</p>
      </header>
      {api.syncError && (
        <div className="sync-error" role="alert">
          <p>{api.syncError}</p>
          <button type="button" className="sync-error__close" aria-label="Đóng thông báo lỗi" onClick={api.dismissError}>
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      )}
      {content}
      <p className="visually-hidden" aria-live="polite" data-testid="announcer">
        {describeEvent(deck.lastEvent, profiles, deck.score)}
      </p>
    </main>
  );
}
