/**
 * DATA CONTRACT — HW1 Photo & Evidence Gallery
 *
 * @typedef {'evidence' | 'campus' | 'nature' | 'tech'} CategoryId
 *
 * @typedef {Object} Category
 * @property {CategoryId} id     Giá trị dùng trong URL: ?category=<id>
 * @property {string} label      Nhãn hiển thị
 *
 * @typedef {Object} Photo
 * @property {string} id         Giá trị dùng trong URL: ?photoId=<id>
 * @property {string} title
 * @property {CategoryId} category
 * @property {string} alt        Mô tả ảnh cho screen reader (WCAG 1.1.1)
 * @property {string} src        Đường dẫn tĩnh trong /public
 * @property {number} width      Kích thước gốc — chống layout shift (CLS = 0)
 * @property {number} height
 * @property {string} takenAt    ISO date (YYYY-MM-DD)
 * @property {string} location
 * @property {string} description
 */

/** @type {readonly Category[]} */
export const CATEGORIES = Object.freeze([
  { id: 'evidence', label: 'Chứng cứ' },
  { id: 'campus', label: 'Khuôn viên' },
  { id: 'nature', label: 'Thiên nhiên' },
  { id: 'tech', label: 'Công nghệ' },
]);

const W = 1200;
const H = 800;

/** @type {readonly Photo[]} */
export const PHOTOS = Object.freeze([
  { id: 'p01', title: 'Hồ sơ vụ việc #01', category: 'evidence', alt: 'Bìa hồ sơ màu cam với nhãn vụ việc số 01', takenAt: '2026-09-02', location: 'Phòng lưu trữ A', description: 'Bìa hồ sơ gốc được niêm phong trước khi chuyển giao.' },
  { id: 'p02', title: 'Dấu vân tay mẫu', category: 'evidence', alt: 'Các vòng tròn đồng tâm mô phỏng dấu vân tay trên nền cam', takenAt: '2026-09-05', location: 'Phòng giám định', description: 'Mẫu đối chiếu dùng trong buổi huấn luyện.' },
  { id: 'p03', title: 'Biên bản niêm phong', category: 'evidence', alt: 'Tờ biên bản có dải băng niêm phong chéo', takenAt: '2026-09-09', location: 'Phòng lưu trữ B', description: 'Biên bản kèm chữ ký của hai bên giám sát.' },
  { id: 'p04', title: 'Toà nhà E', category: 'campus', alt: 'Hình khối toà nhà nhiều tầng trên nền xanh dương', takenAt: '2026-10-01', location: 'UIT — Toà E', description: 'Mặt tiền toà nhà E vào buổi sáng.' },
  { id: 'p05', title: 'Thư viện', category: 'campus', alt: 'Các kệ sách xếp hàng dọc trên nền xanh dương', takenAt: '2026-10-03', location: 'UIT — Thư viện', description: 'Khu đọc sách yên tĩnh tầng 2.' },
  { id: 'p06', title: 'Sân trường', category: 'campus', alt: 'Khoảng sân rộng với hàng cây phía xa trên nền xanh dương', takenAt: '2026-10-06', location: 'UIT — Sân chính', description: 'Sân trường trước giờ chào cờ.' },
  { id: 'p07', title: 'Đồi thông', category: 'nature', alt: 'Dãy đồi nhiều lớp màu xanh lá dưới mặt trời', takenAt: '2026-08-12', location: 'Đà Lạt', description: 'Đồi thông lúc bình minh.' },
  { id: 'p08', title: 'Mặt hồ', category: 'nature', alt: 'Mặt hồ phẳng phản chiếu mặt trời trên nền xanh lá', takenAt: '2026-08-14', location: 'Hồ Tuyền Lâm', description: 'Mặt hồ lặng gió buổi chiều.' },
  { id: 'p09', title: 'Thác nước', category: 'nature', alt: 'Dải nước đổ thẳng xuống giữa hai vách đá xanh', takenAt: '2026-08-16', location: 'Thác Datanla', description: 'Thác nước sau cơn mưa.' },
  { id: 'p10', title: 'Bo mạch', category: 'tech', alt: 'Các đường mạch điện tử đan xen trên nền tím', takenAt: '2026-11-01', location: 'Phòng lab C', description: 'Bo mạch thử nghiệm cho đồ án IoT.' },
  { id: 'p11', title: 'Phòng máy chủ', category: 'tech', alt: 'Các tủ rack xếp hàng với đèn tín hiệu trên nền tím', takenAt: '2026-11-04', location: 'Data center UIT', description: 'Dãy rack máy chủ của khoa.' },
  { id: 'p12', title: 'Màn hình code', category: 'tech', alt: 'Các dòng code nhiều màu trên nền tím', takenAt: '2026-11-08', location: 'Phòng lab S3T', description: 'Phiên làm việc Lab 4 với React Router v7.' },
].map((p) => Object.freeze({ ...p, src: `/photos/${p.id}.svg`, width: W, height: H })));