import { Link, useLocation } from 'react-router';
import { pageTitle } from '../lib/pageTitle.js';

/** Route "*" — mọi URL không khớp route nào. */
export default function NotFoundPage() {
  const { pathname } = useLocation();
  return (
    <section className="page" aria-labelledby="nf-heading">
      <title>{pageTitle('404')}</title>
      <h1 id="nf-heading">404 — Không tìm thấy trang</h1>
      <p className="lead">
        Đường dẫn <code>{pathname}</code> không tồn tại.
      </p>
      <p>
        <Link className="button" to="/">
          Về trang chủ
        </Link>
      </p>
    </section>
  );
}