import { Link, useSearchParams } from 'react-router';
import { PARAM_PHOTO, withParams } from '../../lib/gallery.js';

/**
 * Thẻ ảnh trong lưới — là một <Link> ghi ?photoId= vào URL (giữ nguyên ?category=).
 * width/height cố định + aspect-ratio CSS → trình duyệt giữ chỗ trước khi ảnh tải (CLS = 0).
 * @param {{ photo: import('../../data/photos.js').Photo }} props
 */
export default function PhotoCard({ photo }) {
  const [searchParams] = useSearchParams();

  return (
    <Link
      to={{ search: withParams(searchParams, { [PARAM_PHOTO]: photo.id }) }}
      className="photo-card"
      aria-label={`Xem ảnh lớn: ${photo.title}`}
      data-photo-id={photo.id}
    >
      <figure className="photo-card__figure">
        <img
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          loading="lazy"
          decoding="async"
          className="photo-card__img"
        />
        <figcaption className="photo-card__caption">
          <span className="photo-card__title">{photo.title}</span>
          <span className="photo-card__meta">{photo.location}</span>
        </figcaption>
      </figure>
    </Link>
  );
}