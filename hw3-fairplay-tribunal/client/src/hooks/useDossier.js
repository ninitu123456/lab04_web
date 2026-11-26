import { useApiResource } from './useApiResource.js';

/**
 * DOSSIER DTO (khớp GET /api/dossiers/:playerId).
 * @typedef {{ kind: string, label: string, ref: string }} Evidence
 * @typedef {{ code: string, title: string, severity: number, penaltyMatches: number, evidence: Evidence[] }} Offense
 * @typedef {{
 *   playerId: string, displayName: string, team: string, role: string, summary: string, avatar: string,
 *   offenses: Offense[], verdictAt: string, appealWindowHours: number, slaDeadline: string,
 * }} Dossier
 * @typedef {Omit<Dossier, 'offenses'> & { offenseCount: number }} DossierSummary
 */

/**
 * Chi tiết một hồ sơ. 404 từ server → `notFound: true` (trang hiển thị 404 boundary).
 * @param {string} playerId
 * @returns {ReturnType<typeof useApiResource<Dossier>>}
 */
export function useDossier(playerId) {
  return useApiResource(`/api/dossiers/${encodeURIComponent(playerId)}`);
}

/** Danh sách tóm tắt cho cổng Tribunal. @returns {ReturnType<typeof useApiResource<DossierSummary[]>>} */
export function useDossierList() {
  return useApiResource('/api/dossiers');
}
