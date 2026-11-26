import DisproportionalityMatrix from '../../components/DisproportionalityMatrix.jsx';
import { pageTitle } from '../../lib/pageTitle.js';
import { useDossierContext } from './useDossierContext.js';

export default function DossierMatrix() {
  const { dossier } = useDossierContext();
  return (
    <section aria-labelledby="matrix-title">
      <title>{pageTitle('Ma trận tương xứng', `Hồ sơ ${dossier.displayName}`)}</title>
      <h2 id="matrix-title">Ma trận tương xứng</h2>
      <DisproportionalityMatrix offenses={dossier.offenses} playerName={dossier.displayName} />
    </section>
  );
}
