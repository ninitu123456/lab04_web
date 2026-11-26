import { lazy } from 'react';

// Code-splitting theo route (tách file riêng để routes.jsx chỉ export routes — Fast Refresh, xem AI-004).
// Cổng Tribunal (trang đầu) import tĩnh; các trang hồ sơ chỉ tải khi người dùng mở.
export const DossierLayout = lazy(() => import('./pages/dossier/DossierLayout.jsx'));
export const DossierOverview = lazy(() => import('./pages/dossier/DossierOverview.jsx'));
export const DossierMatrix = lazy(() => import('./pages/dossier/DossierMatrix.jsx'));
export const DossierAppeal = lazy(() => import('./pages/dossier/DossierAppeal.jsx'));
