import { Link } from 'react-router';
import { pageTitle } from '../lib/pageTitle.js';

/**
 * 404 — dùng cho route `*` VÀ làm boundary khi :playerId không tồn tại.
 * @param {{ heading?: string, message?: string }} props
 */
export default function NotFoundPage({
  heading = 'Không tìm thấy trang',
  message = 'Đường dẫn bạn mở không tồn tại hoặc đã bị gỡ.',
}) {
  return (
    <section className="page" aria-labelledby="not-found-title">
      <title>{pageTitle('404', heading)}</title>
      <p className="eyebrow">Lỗi 404</p>
      <h1 id="not-found-title">{heading}</h1>
      <p className="lead">{message}</p>
      <p>
        <Link className="button" to="/">
          Về cổng Tribunal
        </Link>
      </p>
    </section>
  );
}
