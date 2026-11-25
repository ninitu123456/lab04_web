import RootLayout from './layouts/RootLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import RouteErrorPage from './pages/RouteErrorPage.jsx';
import { AboutPage, GalleryPage } from './lazyPages.js';

/**
 * ROUTE CONTRACT — HW1
 *
 *  /                      → <RootLayout> + <HomePage>      (index)
 *  /gallery               → <RootLayout> + <GalleryPage>   (lazy)
 *  /gallery?category=<id> → lọc theo danh mục (deep link)
 *  /gallery?photoId=<id>  → mở lightbox <dialog>          (deep link)
 *  /about                 → <RootLayout> + <AboutPage>     (lazy)
 *  *                      → <RootLayout> + <NotFoundPage>  (404)
 *  errorElement           → <RouteErrorPage> (lỗi render / lỗi tải chunk)
 *
 * Mảng `routes` dùng chung cho createBrowserRouter (app thật)
 * và createMemoryRouter (test).
 * @type {import('react-router').RouteObject[]}
 */
export const routes = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'gallery', element: <GalleryPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];