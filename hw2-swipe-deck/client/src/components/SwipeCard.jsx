import { useId } from 'react';

/**
 * Một thẻ hồ sơ — semantic: <article> có tiêu đề, ảnh có alt, <dl> cho thông tin.
 * @param {{ profile: import('../lib/deck.js').Profile }} props
 */
export default function SwipeCard({ profile }) {
  const titleId = useId();
  return (
    <article className="swipe-card" aria-labelledby={titleId}>
      <img
        className="swipe-card__img"
        src={profile.avatar}
        alt={`Ảnh đại diện minh hoạ của ${profile.name}`}
        width={400}
        height={400}
        draggable={false}
        decoding="async"
      />
      <div className="swipe-card__body">
        <h2 id={titleId} className="swipe-card__name">
          {profile.name}
        </h2>
        {profile.bio && <p className="swipe-card__bio">{profile.bio}</p>}
        <dl className="swipe-card__meta">
          <dt>Tuổi</dt>
          <dd>{profile.age}</dd>
          <dt>Sở thích</dt>
          <dd>
            {profile.interests.length > 0 ? (
              <ul className="tag-list">
                {profile.interests.map((interest) => (
                  <li key={interest} className="tag">
                    {interest}
                  </li>
                ))}
              </ul>
            ) : (
              'Chưa cập nhật'
            )}
          </dd>
        </dl>
      </div>
    </article>
  );
}
