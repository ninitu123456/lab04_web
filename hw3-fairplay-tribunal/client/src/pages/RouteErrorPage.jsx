import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { pageTitle } from '../lib/pageTitle.js';

/** errorElement của route gốc — bắt lỗi render / lỗi tải chunk lazy, tránh màn hình trắng. */
export default function RouteErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Lỗi không xác định';

  return (
    <main className="site-main">
      <title>{pageTitle('Lỗi')}</title>
      <section className="page" role="alert">
        <h1>Đã xảy ra lỗi</h1>
        <p className="lead">{message}</p>
        <p>
          <Link className="button" to="/">
            Về cổng Tribunal
          </Link>
        </p>
      </section>
    </main>
  );
}
