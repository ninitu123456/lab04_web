import { NavLink, Outlet } from 'react-router';

/** Callback className của NavLink (React Router v7 — thay cho activeClassName v5). */
const navLinkClass = ({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link');

const NAV_ITEMS = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/gallery', label: 'Thư viện' },
  { to: '/about', label: 'Giới thiệu' },
];

export default function RootLayout() {
  return (
    <div className="layout">
      <header className="site-header">
        <div className="site-header__inner">
          <span className="brand" aria-hidden="true">
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

      <main id="main-content" className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>Lab 04 — HW1 · Nguyễn Ngọc Thiên Tú · 24521911 · UIT</p>
      </footer>
    </div>
  );
}