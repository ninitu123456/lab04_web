import { useOutletContext } from 'react-router';

/**
 * Hồ sơ đã tải bởi DossierLayout, truyền xuống tab con qua <Outlet context>.
 * @returns {{ dossier: import('../../hooks/useDossier.js').Dossier, clockOffset: number }}
 */
export function useDossierContext() {
  return useOutletContext();
}
