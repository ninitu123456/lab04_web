import RootLayout from './layouts/RootLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import { AboutPage, GalleryPage } from './lazyPages.js';

/**
 * ROUTE CONTRACT — HW1
 *
 *  /                      → <RootLayout> + <HomePage>      (index)
 *  /gallery               → <RootLayout> + <GalleryPage>   (lazy)
 *  /gallery?category=<id> → lọc theo danh mục (deep link)
 *  /gallery?photoId=<id>  → mở lightbox <dialog>          (deep link)
 *  /about                 → <RootLayout> + <AboutPage>     (lazy)
 *  *                      → <RootLayout> + <NotFoundPage>  (commit 12)
 *
 * Mảng `routes` dùng chung cho createBrowserRouter (app thật)
 * và createMemoryRouter (test).
 * @type {import('react-router').RouteObject[]}
 */
export const routes = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'gallery', element: <GalleryPage /> },
      { path: 'about', element: <AboutPage /> },
    ],
  },
];