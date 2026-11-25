import { lazy } from 'react';

// Code-splitting theo route: mỗi trang là một chunk JS riêng, chỉ tải khi cần.
// Trang chủ (route đầu tiên người dùng thấy) giữ import tĩnh trong routes.jsx để LCP nhanh nhất.
export const GalleryPage = lazy(() => import('./features/gallery/GalleryPage.jsx'));
export const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));