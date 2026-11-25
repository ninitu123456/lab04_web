import { useSearchParams } from 'react-router';
import { CATEGORIES, PHOTOS } from '../../data/photos.js';
import {
  filterPhotos,
  findPhotoById,
  isValidCategory,
  PARAM_CATEGORY,
  PARAM_PHOTO,
  withParams,
} from '../../lib/gallery.js';
import CategoryFilter from './CategoryFilter.jsx';
import Lightbox from './Lightbox.jsx';
import PhotoGrid from './PhotoGrid.jsx';

/**
 * /gallery — mọi state chia sẻ được đều nằm trên URL:
 *   ?category=<id>  → bộ lọc
 *   ?photoId=<id>   → ảnh đang mở trong lightbox
 * Danh sách hiển thị và ảnh đang chọn là state DẪN XUẤT, tính đồng bộ trong render.
 */
export default function GalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get(PARAM_CATEGORY);
  const photoId = searchParams.get(PARAM_PHOTO);

  const isUnknownCategory = Boolean(category) && !isValidCategory(category);
  const visiblePhotos = filterPhotos(PHOTOS, category);
  const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label;
  const selectedPhoto = findPhotoById(PHOTOS, photoId);

  const closeLightbox = () => {
    if (!searchParams.has(PARAM_PHOTO)) return;
    setSearchParams(withParams(searchParams, { [PARAM_PHOTO]: null }));
  };

  return (
    <section className="page" aria-labelledby="gallery-heading">
      <h1 id="gallery-heading">Thư viện ảnh</h1>

      <CategoryFilter active={category} />

      <p role="status" className="gallery-status">
        {isUnknownCategory
          ? `Không tìm thấy danh mục “${category}”. Hãy chọn một danh mục khác.`
          : `Đang hiển thị ${visiblePhotos.length} ảnh${categoryLabel ? ` — ${categoryLabel}` : ''}`}
      </p>

      <PhotoGrid photos={visiblePhotos} />

      <Lightbox photo={selectedPhoto} onClose={closeLightbox} />
    </section>
  );
}