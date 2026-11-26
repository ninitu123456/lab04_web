import { Suspense, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import PageSkeleton from '../components/PageSkeleton.jsx';

/** Callback className của NavLink (React Router v7 — thay cho activeClassName v5). */
const navLinkClass = ({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link');

const NAV_ITEMS = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/gallery', label: 'Thư viện' },
  { to: '/about', label: 'Giới thiệu' },
];

export default function RootLayout() {
  const { pathname } = useLocation();
  const mainRef = useRef(/** @type {HTMLElement | null} */ (null));
  const isFirstRender = useRef(true);
  // Dẫn xuất trong render: trang Thư viện → skeleton lưới ảnh, trang khác → skeleton văn bản.
  const skeletonVariant = pathname.startsWith('/gallery') ? 'grid' : 'text';

  // SPA không tải lại trang → screen reader không biết đã sang trang mới.
  // Khi đổi ROUTE (pathname, không tính query string) → đưa focus về <main>.
  // Bỏ qua lần render đầu để không cướp focus khi vừa mở trang.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [pathname]);

  return (
    <div className="layout">
      <a href="#main-content" className="skip-link">
        Bỏ qua tới nội dung chính
      </a>
      <header className="site-header">
        <div className="site-header__inner">
          <span className="brand">
            UIT<span className="brand__accent">·</span>Evidence
          </span>
          <nav aria-label="Điều hướng chính">
            <ul className="nav-list">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.end} className={navLinkClass}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main-content" className="site-main" ref={mainRef} tabIndex={-1}>
        {/* Suspense boundary cho các route lazy — fallback cùng hình dạng nội dung thật (CLS = 0). */}
        <Suspense fallback={<PageSkeleton variant={skeletonVariant} />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="site-footer">
        <p>Lab 04 — HW1 · Nguyễn Ngọc Thiên Tú · 24521911 · UIT</p>
      </footer>
    </div>
  );
}