import { Link } from 'react-router';
import { CATEGORIES } from '../../data/photos.js';
import { PARAM_CATEGORY } from '../../lib/gallery.js';

/**
 * Bộ lọc danh mục — mỗi lựa chọn là một <Link> đổi query string.
 * Không giữ state cục bộ: URL là nguồn sự thật duy nhất (deep link).
 * @param {{ active: string | null }} props
 */
export default function CategoryFilter({ active = null }) {
  const options = [{ id: null, label: 'Tất cả' }, ...CATEGORIES];

  return (
    <nav aria-label="Lọc theo danh mục" className="filter">
      <ul className="filter__list">
        {options.map((option) => {
          const isActive = option.id === active;
          const to = option.id ? `?${PARAM_CATEGORY}=${encodeURIComponent(option.id)}` : '/gallery';
          return (
            <li key={option.id ?? 'all'}>
              <Link
                to={to}
                className={isActive ? 'chip chip--active' : 'chip'}
                aria-current={isActive ? 'true' : undefined}
              >
                {option.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}