import { useSearchParams } from 'react-router';
import { CATEGORIES, PHOTOS } from '../../data/photos.js';
import { filterPhotos, isValidCategory, PARAM_CATEGORY } from '../../lib/gallery.js';
import CategoryFilter from './CategoryFilter.jsx';
import PhotoGrid from './PhotoGrid.jsx';

/**
 * /gallery — state lọc đọc trực tiếp từ URL bằng useSearchParams.
 * Danh sách hiển thị là state DẪN XUẤT: tính đồng bộ trong render, không useState/useEffect.
 */
export default function GalleryPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get(PARAM_CATEGORY);

  const isUnknownCategory = Boolean(category) && !isValidCategory(category);
  const visiblePhotos = filterPhotos(PHOTOS, category);
  const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label;

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
    </section>
  );
}