import { APPEAL_REASONS } from '@shared/appealRules.js';

/** Commit 1: khung client — router & các trang được thêm ở commit 3. */
export default function App() {
  return (
    <main className="site-main">
      <h1>Fair-Play Appeal Tribunal</h1>
      <p className="disclaimer">Dữ liệu giả lập phục vụ bài tập.</p>
      <p>Hỗ trợ {APPEAL_REASONS.length} loại lý do kháng cáo (contract dùng chung với server).</p>
    </main>
  );
}
