import RootLayout from './layouts/RootLayout.jsx';
import { DossierAppeal, DossierLayout, DossierMatrix, DossierOverview } from './lazyPages.js';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PortalPage from './pages/PortalPage.jsx';
import RouteErrorPage from './pages/RouteErrorPage.jsx';

/**
 * ROUTE CONTRACT — HW3 (một mảng dùng chung createBrowserRouter & createMemoryRouter trong test)
 *
 *  /                            → <RootLayout> + <PortalPage>        danh sách hồ sơ
 *  /dossier/:playerId           → <DossierLayout> (lazy) + tab con qua <Outlet />
 *      index                    → <DossierOverview>  tổng quan + bằng chứng
 *      matrix                   → <DossierMatrix>    ma trận tương xứng (useMemo)
 *      appeal                   → <DossierAppeal>    form kháng cáo
 *  *                            → <NotFoundPage>     404
 *  errorElement                 → <RouteErrorPage>
 *
 * MỘT route động `:playerId` (useParams) thay cho 2 route cứng /dossier/himass, /dossier/tanvuu của slide 33.
 * @type {import('react-router').RouteObject[]}
 */
export const routes = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <PortalPage /> },
      {
        path: 'dossier/:playerId',
        element: <DossierLayout />,
        children: [
          { index: true, element: <DossierOverview /> },
          { path: 'matrix', element: <DossierMatrix /> },
          { path: 'appeal', element: <DossierAppeal /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
