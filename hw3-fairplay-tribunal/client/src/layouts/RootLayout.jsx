import { Suspense, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import PageSkeleton from '../components/PageSkeleton.jsx';

const navLinkClass = ({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link');

const NAV_ITEMS = [
  { to: '/', label: 'Cổng Tribunal', end: true },
  { to: '/dossier/himass', label: 'Hồ sơ Himass' },
  { to: '/dossier/tanvuu', label: 'Hồ sơ TanVuu' },
];

/**
 * "Khu vực" của URL: /dossier/himass/matrix → /dossier/himass.
 * Đổi tab trong cùng hồ sơ thì giữ focus ở thanh tab; đổi sang trang khác thì đưa focus về <main>.
 */
const sectionOf = (pathname) => pathname.split('/').slice(0, 3).join('/');

export default function RootLayout() {
  const { pathname } = useLocation();
  const section = sectionOf(pathname);
  const mainRef = useRef(/** @type {HTMLElement | null} */ (null));
  const isFirstRender = useRef(true);

  // Đồng bộ focus (DOM API) khi đổi trang — SPA không tải lại nên screen reader không biết đã sang trang mới.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [section]);

  return (
    <div className="layout">
      <a href="#main-content" className="skip-link">
        Bỏ qua tới nội dung chính
      </a>
      <header className="site-header">
        <div className="site-header__inner">
          <span className="brand">
            Fair-Play<span className="brand__accent"> Tribunal</span>
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
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="site-footer">
        <p>
          <strong>Dữ liệu giả lập phục vụ bài tập</strong> — mọi vi phạm, hình phạt và bằng chứng đều là hư cấu.
        </p>
        <p>Lab 04 — HW3 · Nguyễn Ngọc Thiên Tú · 24521911 · UIT</p>
      </footer>
    </div>
  );
}
