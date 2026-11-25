import { Link, useSearchParams } from 'react-router';
import { CATEGORIES, PHOTOS } from '../../data/photos.js';
import {
  filterPhotos,
  findPhotoById,
  getAdjacentPhotoId,
  isValidCategory,
  PARAM_CATEGORY,
  PARAM_PHOTO,
  withParams,
} from '../../lib/gallery.js';
import { pageTitle } from '../../lib/pageTitle.js';
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
  const isUnknownPhoto = Boolean(photoId) && !selectedPhoto;

  // Vị trí ảnh trong danh sách ĐANG LỌC (derived state — không useState).
  const indexInView = visiblePhotos.findIndex((p) => p.id === photoId);
  const inView = indexInView !== -1;
  const prevId = inView ? getAdjacentPhotoId(visiblePhotos, photoId, -1) : undefined;
  const nextId = inView ? getAdjacentPhotoId(visiblePhotos, photoId, 1) : undefined;
  const position = inView ? { index: indexInView + 1, total: visiblePhotos.length } : undefined;

  /** Chuyển ảnh: replace để nút Back của trình duyệt đóng lightbox thay vì lùi từng ảnh. */
  const navigateTo = (id) => {
    setSearchParams(withParams(searchParams, { [PARAM_PHOTO]: id }), { replace: true });
  };

  const closeLightbox = () => {
    if (!photoId) return;
    setSearchParams(withParams(searchParams, { [PARAM_PHOTO]: null }));
    // WCAG 2.4.3 Focus Order: trả focus về thẻ ảnh tương ứng (kể cả sau khi đã chuyển ảnh).
    document.querySelector(`[data-photo-id="${photoId}"]`)?.focus();
  };

  return (
    <section className="page" aria-labelledby="gallery-heading">
      {/* React 19: <title> render ở bất kỳ đâu sẽ được hoist lên <head>. */}
      <title>{pageTitle(selectedPhoto?.title, categoryLabel, 'Thư viện ảnh')}</title>
      <h1 id="gallery-heading">Thư viện ảnh</h1>

      <CategoryFilter active={category} />

      <p role="status" className="gallery-status">
        {isUnknownCategory
          ? `Không tìm thấy danh mục “${category}”. Hãy chọn một danh mục khác.`
          : `Đang hiển thị ${visiblePhotos.length} ảnh${categoryLabel ? ` — ${categoryLabel}` : ''}`}
      </p>

      {isUnknownPhoto && (
        <div role="alert" className="alert">
          <p>
            Không tìm thấy ảnh “{photoId}”. Ảnh có thể đã bị xoá hoặc đường link bị sai.
          </p>
          <Link className="button" to={{ search: withParams(searchParams, { [PARAM_PHOTO]: null }) }}>
            Bỏ qua và xem thư viện
          </Link>
        </div>
      )}

      <PhotoGrid photos={visiblePhotos} />

      <Lightbox
        photo={selectedPhoto}
        onClose={closeLightbox}
        onNavigate={navigateTo}
        prevId={prevId}
        nextId={nextId}
        position={position}
      />
    </section>
  );
}