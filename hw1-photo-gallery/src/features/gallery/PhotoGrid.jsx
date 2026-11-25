import PhotoCard from './PhotoCard.jsx';

/**
 * Lưới ảnh — <ul> có nhãn để screen reader đọc được "Danh sách ảnh, n mục".
 * @param {{ photos: readonly import('../../data/photos.js').Photo[] }} props
 */
export default function PhotoGrid({ photos }) {
  return (
    <ul className="photo-grid" aria-label="Danh sách ảnh">
      {photos.map((photo) => (
        <li key={photo.id} className="photo-grid__item">
          <PhotoCard photo={photo} />
        </li>
      ))}
    </ul>
  );
}