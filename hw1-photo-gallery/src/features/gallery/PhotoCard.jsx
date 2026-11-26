import { Link, useSearchParams } from 'react-router';
import { PARAM_PHOTO, withParams } from '../../lib/gallery.js';

/**
 * Thẻ ảnh trong lưới — là một <Link> ghi ?photoId= vào URL (giữ nguyên ?category=).
 * width/height cố định + aspect-ratio CSS → trình duyệt giữ chỗ trước khi ảnh tải (CLS = 0).
 * `priority` = ảnh nằm trong màn hình đầu → tải eager + fetchpriority="high" (LCP).
 * @param {{ photo: import('../../data/photos.js').Photo, priority?: boolean }} props
 */
export default function PhotoCard({ photo, priority = false }) {
  const [searchParams] = useSearchParams();

  return (
    <Link
      to={{ search: withParams(searchParams, { [PARAM_PHOTO]: photo.id }) }}
      className="photo-card"
      aria-label={`Xem ảnh lớn: ${photo.title}, ${photo.location}`}
      data-photo-id={photo.id}
    >
      <figure className="photo-card__figure">
        <img
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          className="photo-card__img"
        />
        {/* Khoảng trắng giữa 2 span: tên hiển thị phải nằm trong accessible name (WCAG 2.5.3 Label in Name) */}
        <figcaption className="photo-card__caption">
          <span className="photo-card__title">{photo.title}</span>{' '}
          <span className="photo-card__meta">{photo.location}</span>
        </figcaption>
      </figure>
    </Link>
  );
}
