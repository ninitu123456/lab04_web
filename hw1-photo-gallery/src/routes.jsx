/**
 * ROUTE CONTRACT — HW1
 *
 *  /                      → <Layout> + <HomePage>      (index)
 *  /gallery               → <Layout> + <GalleryPage>   (toàn bộ ảnh)
 *  /gallery?category=<id> → lọc theo danh mục (deep link)
 *  /gallery?photoId=<id>  → mở lightbox <dialog>      (deep link)
 *  /about                 → <Layout> + <AboutPage>
 *  *                      → <Layout> + <NotFoundPage>
 *
 * Mảng `routes` dùng chung cho createBrowserRouter (app thật)
 * và createMemoryRouter (test).
 *
 * TODO(commit 6): hiện thực layout + các route.
 * @type {import('react-router').RouteObject[]}
 */
export const routes = [];