import { pageTitle } from '../../lib/pageTitle.js';
import { useDossierContext } from './useDossierContext.js';

/** Tab kháng cáo — form engine được thêm ở commit 4. */
export default function DossierAppeal() {
  const { dossier } = useDossierContext();
  return (
    <section aria-labelledby="appeal-title">
      <title>{pageTitle('Gửi kháng cáo', `Hồ sơ ${dossier.displayName}`)}</title>
      <h2 id="appeal-title">Gửi kháng cáo</h2>
      <p>Biểu mẫu kháng cáo cho hồ sơ {dossier.displayName} đang được hoàn thiện.</p>
    </section>
  );
}
