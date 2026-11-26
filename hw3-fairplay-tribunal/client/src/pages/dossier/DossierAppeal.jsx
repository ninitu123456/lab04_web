import AppealForm from '../../features/appeal/AppealForm.jsx';
import { pageTitle } from '../../lib/pageTitle.js';
import { useDossierContext } from './useDossierContext.js';

/** Tên hiển thị cho ô chọn hồ sơ (dữ liệu giả lập). */
const PLAYER_NAMES = { himass: 'Himass', tanvuu: 'TanVuu' };

export default function DossierAppeal() {
  const { dossier } = useDossierContext();
  return (
    <section aria-labelledby="appeal-title">
      <title>{pageTitle('Gửi kháng cáo', `Hồ sơ ${dossier.displayName}`)}</title>
      <h2 id="appeal-title">Gửi kháng cáo</h2>
      {/* key: đổi hồ sơ → form mới hoàn toàn (không cần effect để reset state) */}
      <AppealForm key={dossier.playerId} playerId={dossier.playerId} playerNames={PLAYER_NAMES} />
    </section>
  );
}
