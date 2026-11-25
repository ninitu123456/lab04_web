import { CATEGORIES } from '../data/photos.js';

/** Tên query param — dùng chung để tránh gõ sai chuỗi. */
export const PARAM_CATEGORY = 'category';
export const PARAM_PHOTO = 'photoId';

/**
 * @param {string | null | undefined} id
 * @returns {boolean}
 */
export function isValidCategory(id) {
  return CATEGORIES.some((c) => c.id === id);
}

/**
 * Lọc ảnh theo danh mục — hàm thuần, chạy đồng bộ trong render.
 * - `category` rỗng/null     → trả về toàn bộ
 * - `category` hợp lệ        → chỉ ảnh thuộc danh mục
 * - `category` không tồn tại → mảng rỗng (UI hiển thị thông báo)
 * @param {readonly import('../data/photos.js').Photo[]} photos
 * @param {string | null | undefined} category
 */
export function filterPhotos(photos, category) {
  if (!category) return photos;
  if (!isValidCategory(category)) return [];
  return photos.filter((p) => p.category === category);
}

/**
 * @param {readonly import('../data/photos.js').Photo[]} photos
 * @param {string | null | undefined} id
 */
export function findPhotoById(photos, id) {
  if (!id) return undefined;
  return photos.find((p) => p.id === id);
}

/**
 * Lấy id ảnh kế tiếp / trước đó trong danh sách đang hiển thị (vòng tròn).
 * @param {readonly import('../data/photos.js').Photo[]} list
 * @param {string} currentId
 * @param {1 | -1} direction
 * @returns {string | undefined}
 */
export function getAdjacentPhotoId(list, currentId, direction) {
  const index = list.findIndex((p) => p.id === currentId);
  if (index === -1 || list.length === 0) return undefined;
  const next = (index + direction + list.length) % list.length;
  return list[next].id;
}