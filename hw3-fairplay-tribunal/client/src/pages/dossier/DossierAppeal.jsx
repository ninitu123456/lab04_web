import AppealForm from '../../features/appeal/AppealForm.jsx';
import { useAppealSlaTimer } from '../../hooks/useAppealSlaTimer.js';
import { pageTitle } from '../../lib/pageTitle.js';
import { useDossierContext } from './useDossierContext.js';

/** Tên hiển thị cho ô chọn hồ sơ (dữ liệu giả lập). */
const PLAYER_NAMES = { himass: 'Himass', tanvuu: 'TanVuu' };

export default function DossierAppeal() {
  const { dossier, clockOffset } = useDossierContext();
  // Chỉ cần biết hết hạn hay chưa → tick thưa (5s); server vẫn chặn bằng 409 nếu lọt qua.
  const { isExpired } = useAppealSlaTimer(dossier.slaDeadline, { offset: clockOffset, tickMs: 5000 });
  return (
    <section aria-labelledby="appeal-title">
      <title>{pageTitle('Gửi kháng cáo', `Hồ sơ ${dossier.displayName}`)}</title>
      <h2 id="appeal-title">Gửi kháng cáo</h2>
      {/* key: đổi hồ sơ → form mới hoàn toàn (không cần effect để reset state) */}
      {isExpired && (
        <p className="form-error" role="alert">
          Đã hết hạn kháng cáo cho hồ sơ này — biểu mẫu không thể gửi.
        </p>
      )}
      <AppealForm key={dossier.playerId} playerId={dossier.playerId} playerNames={PLAYER_NAMES} expired={isExpired} />
    </section>
  );
}
