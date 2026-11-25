import { Link } from 'react-router';

export default function HomePage() {
  return (
    <section className="page">
      <h1>UIT Evidence Gallery</h1>
      <p className="lead">
        Thư viện ảnh nhiều route xây dựng bằng React 19 và React Router v7. Bộ lọc danh mục và
        ảnh đang xem đều nằm trên URL nên mọi trạng thái đều có thể chia sẻ bằng một đường link.
      </p>
      <p>
        <Link className="button" to="/gallery">
          Mở thư viện ảnh
        </Link>
      </p>
    </section>
  );
}