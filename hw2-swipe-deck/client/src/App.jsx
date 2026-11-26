import { useState } from 'react';
import SwipeDeck from './components/SwipeDeck.jsx';
import { FIXTURE_PROFILES } from './data/fixtureProfiles.js';
import { DIRECTION_LABELS } from './lib/deck.js';

/**
 * Commit 3: deck chạy với fixture, chưa gọi API.
 * `history` là state duy nhất; deck còn lại và thông báo đều DẪN XUẤT trong render.
 */
export default function App({ profiles = FIXTURE_PROFILES }) {
  const [history, setHistory] = useState(
    /** @type {Array<{ profileId: string, direction: import('./lib/deck.js').Direction }>} */ ([]),
  );

  const swipedIds = new Set(history.map((entry) => entry.profileId));
  const remaining = profiles.filter((p) => !swipedIds.has(p._id));
  const current = remaining[0];

  const last = history.at(-1);
  const lastProfile = last && profiles.find((p) => p._id === last.profileId);
  const announcement = lastProfile ? `${DIRECTION_LABELS[last.direction]}: ${lastProfile.name}.` : '';

  const handleSwipe = (direction) => {
    if (!current) return;
    setHistory((prev) => [...prev, { profileId: current._id, direction }]);
  };

  return (
    <main className="app">
      <header className="app__header">
        <h1>Hẹn Hò Nhưng Không Yêu</h1>
        <p className="app__tagline">Vuốt cho vui — không ai yêu ai cả.</p>
      </header>
      <SwipeDeck profile={current} remaining={remaining.length} onSwipe={handleSwipe} />
      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
    </main>
  );
}
