import PhotoCard from './PhotoCard.jsx';

/** Số ảnh đầu tiên (above the fold) được tải ưu tiên — tối ưu LCP. */
export const PRIORITY_COUNT = 4;

/**
 * Lưới ảnh — <ul> có nhãn để screen reader đọc được "Danh sách ảnh, n mục".
 * @param {{ photos: readonly import('../../data/photos.js').Photo[] }} props
 */
export default function PhotoGrid({ photos }) {
  return (
    <ul className="photo-grid" aria-label="Danh sách ảnh">
      {photos.map((photo, index) => (
        <li key={photo.id} className="photo-grid__item">
          <PhotoCard photo={photo} priority={index < PRIORITY_COUNT} />
        </li>
      ))}
    </ul>
  );
}
