/**
 * Thẻ ảnh trong lưới.
 * width/height cố định + aspect-ratio CSS → trình duyệt giữ chỗ trước khi ảnh tải (CLS = 0).
 * @param {{ photo: import('../../data/photos.js').Photo }} props
 */
export default function PhotoCard({ photo }) {
  return (
    <figure className="photo-card">
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
  );
}