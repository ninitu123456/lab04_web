/**
 * APPEAL VALIDATION CONTRACT — dùng CHUNG cho client (validate real-time trong render)
 * và server (POST /api/appeals). Một bộ rule duy nhất → client/server validation parity.
 * ESM thuần, không phụ thuộc thư viện nào.
 *
 * @typedef {'evidence-error' | 'disproportionate-penalty' | 'procedural-violation' | 'other'} AppealReason
 *
 * @typedef {Object} AppealInput
 * @property {string}  playerId       Bắt buộc, thuộc PLAYER_IDS
 * @property {string}  appellantName  2–60 ký tự (sau khi trim)
 * @property {string}  email          Định dạng email
 * @property {string}  confirmEmail   Phải TRÙNG email (cross-field) — không lưu DB
 * @property {AppealReason} reason
 * @property {string}  statement      50–2000 ký tự (sau khi trim)
 * @property {string}  [evidenceUrl]  Tuỳ chọn; nếu có phải là URL http/https
 * @property {boolean} acceptTerms    Phải là true — không lưu DB
 *
 * @typedef {Partial<Record<keyof AppealInput, string>>} AppealErrors   field → thông báo lỗi (tiếng Việt)
 */

/** Hồ sơ hợp lệ (slug dùng trong URL /dossier/:playerId). */
export const PLAYER_IDS = Object.freeze(['himass', 'tanvuu']);

/** Lý do kháng cáo — value lưu DB, label hiển thị. */
export const APPEAL_REASONS = Object.freeze([
  Object.freeze({ value: 'evidence-error', label: 'Sai sót trong bằng chứng' }),
  Object.freeze({ value: 'disproportionate-penalty', label: 'Mức phạt không tương xứng' }),
  Object.freeze({ value: 'procedural-violation', label: 'Vi phạm quy trình xử lý' }),
  Object.freeze({ value: 'other', label: 'Lý do khác' }),
]);

export const LIMITS = Object.freeze({
  appellantName: Object.freeze({ min: 2, max: 60 }),
  statement: Object.freeze({ min: 50, max: 2000 }),
});

/** Thứ tự field trên form — dùng để focus vào lỗi đầu tiên. */
export const APPEAL_FIELDS = Object.freeze([
  'playerId',
  'appellantName',
  'email',
  'confirmEmail',
  'reason',
  'statement',
  'evidenceUrl',
  'acceptTerms',
]);

/** Giá trị rỗng ban đầu của form. @type {Readonly<AppealInput>} */
export const EMPTY_APPEAL = Object.freeze({
  playerId: '',
  appellantName: '',
  email: '',
  confirmEmail: '',
  reason: '',
  statement: '',
  evidenceUrl: '',
  acceptTerms: false,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** @param {unknown} v */
const text = (v) => (typeof v === 'string' ? v.trim() : '');

/** @param {string} value */
function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Hàm THUẦN: values → lỗi. Chỉ chứa field không hợp lệ; `{}` nghĩa là hợp lệ.
 * Không throw với input bất kỳ (null, kiểu sai...) vì server nhận body tuỳ ý.
 * @param {Partial<Record<keyof AppealInput, unknown>> | null | undefined} values
 * @returns {AppealErrors}
 */
export function validateAppeal(values) {
  const v = values && typeof values === 'object' ? values : {};
  /** @type {AppealErrors} */
  const errors = {};

  const playerId = text(v.playerId);
  if (!playerId) errors.playerId = 'Vui lòng chọn hồ sơ cần kháng cáo.';
  else if (!PLAYER_IDS.includes(playerId)) errors.playerId = 'Hồ sơ không tồn tại.';

  const name = text(v.appellantName);
  const { min: nameMin, max: nameMax } = LIMITS.appellantName;
  if (!name) errors.appellantName = 'Vui lòng nhập họ tên người kháng cáo.';
  else if (name.length < nameMin) errors.appellantName = `Họ tên phải có ít nhất ${nameMin} ký tự.`;
  else if (name.length > nameMax) errors.appellantName = `Họ tên tối đa ${nameMax} ký tự.`;

  const email = text(v.email);
  if (!email) errors.email = 'Vui lòng nhập email.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Email không đúng định dạng (ví dụ: ten@example.com).';

  // Cross-field: so sánh với email (không phân biệt hoa thường).
  const confirmEmail = text(v.confirmEmail);
  if (!confirmEmail) errors.confirmEmail = 'Vui lòng nhập lại email.';
  else if (confirmEmail.toLowerCase() !== email.toLowerCase()) errors.confirmEmail = 'Email nhập lại không khớp.';

  const reason = text(v.reason);
  if (!reason) errors.reason = 'Vui lòng chọn lý do kháng cáo.';
  else if (!APPEAL_REASONS.some((r) => r.value === reason)) errors.reason = 'Lý do kháng cáo không hợp lệ.';

  const statement = text(v.statement);
  const { min: stMin, max: stMax } = LIMITS.statement;
  if (!statement) errors.statement = 'Vui lòng trình bày nội dung kháng cáo.';
  else if (statement.length < stMin) errors.statement = `Nội dung cần ít nhất ${stMin} ký tự (hiện có ${statement.length}).`;
  else if (statement.length > stMax) errors.statement = `Nội dung tối đa ${stMax} ký tự (hiện có ${statement.length}).`;

  const evidenceUrl = text(v.evidenceUrl);
  if (evidenceUrl && !isHttpUrl(evidenceUrl)) errors.evidenceUrl = 'Liên kết bằng chứng phải là URL http:// hoặc https://.';

  if (v.acceptTerms !== true) errors.acceptTerms = 'Bạn cần xác nhận cam kết trước khi gửi.';

  return errors;
}

/** @param {AppealErrors} errors */
export const isValid = (errors) => Object.keys(errors).length === 0;

/**
 * Chuẩn hoá dữ liệu HỢP LỆ để lưu: trim, email thường, bỏ confirmEmail/acceptTerms.
 * @param {AppealInput} values
 */
export function normalizeAppeal(values) {
  const evidenceUrl = text(values.evidenceUrl);
  return {
    playerId: text(values.playerId),
    appellantName: text(values.appellantName),
    email: text(values.email).toLowerCase(),
    reason: text(values.reason),
    statement: text(values.statement),
    ...(evidenceUrl ? { evidenceUrl } : {}),
  };
}
