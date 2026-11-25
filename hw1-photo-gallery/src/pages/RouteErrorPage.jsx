import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

/**
 * errorElement của route gốc — bắt lỗi render/lỗi tải chunk lazy,
 * tránh màn hình trắng (uncaught error).
 */
export default function RouteErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Lỗi không xác định';

  return (
    <main className="site-main">
      <section className="page" role="alert">
        <h1>Đã xảy ra lỗi</h1>
        <p className="lead">{message}</p>
        <p>
          <Link className="button" to="/">
            Về trang chủ
          </Link>
        </p>
      </section>
    </main>
  );
}