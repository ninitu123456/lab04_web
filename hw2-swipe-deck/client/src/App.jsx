import DeckSummary from './components/DeckSummary.jsx';
import ScoreBoard from './components/ScoreBoard.jsx';
import SwipeDeck from './components/SwipeDeck.jsx';
import { FIXTURE_PROFILES } from './data/fixtureProfiles.js';
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

export default function App({ profiles = FIXTURE_PROFILES }) {
  const deck = useSwipeDeck(profiles);

  return (
    <main className="app">
      <header className="app__header">
        <h1>Hẹn Hò Nhưng Không Yêu</h1>
        <p className="app__tagline">Vuốt cho vui — không ai yêu ai cả.</p>
      </header>
      <ScoreBoard score={deck.score} stats={deck.stats} />
      <SwipeDeck
        profile={deck.current}
        remaining={deck.remaining.length}
        onSwipe={deck.swipe}
        onUndo={deck.undo}
        canUndo={deck.canUndo}
        emptyState={<DeckSummary total={profiles.length} score={deck.score} stats={deck.stats} />}
      />
      <p className="visually-hidden" aria-live="polite" data-testid="announcer">
        {describeEvent(deck.lastEvent, profiles, deck.score)}
      </p>
    </main>
  );
}
