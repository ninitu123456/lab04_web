import {
  APPEAL_FIELDS,
  APPEAL_REASONS,
  EMPTY_APPEAL,
  LIMITS,
  PLAYER_IDS,
  validateAppeal,
} from '@shared/appealRules.js';
import { useRef, useState } from 'react';
import { useAppealSubmit } from '../../hooks/useAppealSubmit.js';
import { CheckboxField, InputField, SelectField, TextareaField } from './fields.jsx';
import { FormContext } from './FormContext.js';
import ShowData from './ShowData.jsx';

const FIELD_LABELS = {
  playerId: 'Hồ sơ kháng cáo',
  appellantName: 'Họ tên người kháng cáo',
  email: 'Email liên hệ',
  confirmEmail: 'Nhập lại email',
  reason: 'Lý do kháng cáo',
  statement: 'Nội dung kháng cáo',
  evidenceUrl: 'Liên kết bằng chứng',
  acceptTerms: 'Cam kết',
};

/**
 * APPEAL FORM ENGINE — Context-driven, validate REAL-TIME đồng bộ trong render.
 *
 * - `values` là state dữ liệu duy nhất của form; `errors = validateAppeal(values)` tính MỖI render
 *   bằng CHÍNH hàm mà server dùng (shared/) → không có useEffect validate, không có "validation waterfall".
 * - `touched` / `submitCount`: chỉ quyết định KHI NÀO hiện lỗi (sau blur hoặc sau lần submit đầu).
 * - Lỗi 400 từ server được gắn với snapshot giá trị lúc gửi: field đổi giá trị → lỗi server tự ẩn (derived).
 * - Nút submit KHÔNG disabled: người dùng luôn submit được và thấy lỗi; submit lỗi → focus field lỗi đầu tiên.
 *
 * @param {{
 *   playerId: string,
 *   playerNames?: Record<string, string>,
 *   expired?: boolean,
 * }} props
 */
export default function AppealForm({ playerId, playerNames = {}, expired = false }) {
  const [values, setValues] = useState(() => ({ ...EMPTY_APPEAL, playerId }));
  const [touched, setTouched] = useState(() => new Set());
  const [submitCount, setSubmitCount] = useState(0);
  const [server, setServer] = useState(
    /** @type {{ errors: Record<string, string>, snapshot: object } | null} */ (null),
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(/** @type {string | null} */ (null));
  const [created, setCreated] = useState(/** @type {object | null} */ (null));
  const formRef = useRef(/** @type {HTMLFormElement | null} */ (null));
  const submit = useAppealSubmit();

  // ---- Derived state (tính trong render, KHÔNG useEffect) ----
  const clientErrors = validateAppeal(values);
  const serverErrorFor = (name) =>
    server && server.errors[name] && server.snapshot[name] === values[name] ? server.errors[name] : undefined;
  const errorFor = (name) =>
    touched.has(name) || submitCount > 0 ? (clientErrors[name] ?? serverErrorFor(name)) : undefined;
  const visibleErrors = APPEAL_FIELDS.filter((name) => errorFor(name));

  const setValue = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));
  const markTouched = (name) =>
    setTouched((prev) => (prev.has(name) ? prev : new Set(prev).add(name)));

  /** Focus theo `name` (form.elements) — gọi ngay trong event handler, không cần effect. */
  const focusField = (name) => {
    const el = formRef.current?.elements.namedItem(name);
    if (el instanceof HTMLElement) el.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitCount((n) => n + 1);
    setSubmitError(null);

    const firstInvalid = APPEAL_FIELDS.find((name) => clientErrors[name]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return; // không gọi API khi client đã biết là lỗi
    }
    if (expired) {
      setSubmitError('Đã hết hạn kháng cáo (SLA) — không thể gửi.');
      return;
    }

    setSubmitting(true);
    const result = await submit(values);
    if (result.status === 'aborted') return; // component đã unmount → không setState
    setSubmitting(false);

    if (result.status === 'created') {
      setCreated(result.data);
    } else if (result.status === 'invalid') {
      setServer({ errors: result.errors, snapshot: values });
      const firstServer = APPEAL_FIELDS.find((name) => result.errors[name]);
      if (firstServer) focusField(firstServer);
      else setSubmitError(Object.values(result.errors).join(' '));
    } else {
      setSubmitError(result.message);
    }
  };

  const reset = () => {
    setValues({ ...EMPTY_APPEAL, playerId });
    setTouched(new Set());
    setSubmitCount(0);
    setServer(null);
    setCreated(null);
    setSubmitError(null);
  };

  if (created) return <ShowData data={created} playerName={playerNames[created.playerId]} onReset={reset} />;

  const playerOptions = PLAYER_IDS.map((id) => ({ value: id, label: playerNames[id] ?? id }));

  return (
    <FormContext.Provider value={{ values, setValue, markTouched, errorFor }}>
      <form ref={formRef} className="appeal-form" noValidate onSubmit={handleSubmit} aria-describedby="appeal-form-note">
        <p id="appeal-form-note" className="field__hint">
          Các trường đánh dấu "(bắt buộc)" phải điền. Lỗi được kiểm tra ngay khi bạn rời khỏi ô nhập.
        </p>

        {submitCount > 0 && visibleErrors.length > 0 && (
          <div className="error-summary" role="alert" aria-labelledby="error-summary-title">
            <h3 id="error-summary-title">Có {visibleErrors.length} lỗi cần sửa</h3>
            <ul>
              {visibleErrors.map((name) => (
                <li key={name}>
                  <button type="button" className="link-button" onClick={() => focusField(name)}>
                    {FIELD_LABELS[name]}: {errorFor(name)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <SelectField name="playerId" label={FIELD_LABELS.playerId} options={playerOptions} required />
        <InputField name="appellantName" label={FIELD_LABELS.appellantName} autoComplete="name" required
          hint={`${LIMITS.appellantName.min}–${LIMITS.appellantName.max} ký tự.`} />
        <InputField name="email" label={FIELD_LABELS.email} type="email" autoComplete="email" inputMode="email" required />
        <InputField name="confirmEmail" label={FIELD_LABELS.confirmEmail} type="email" autoComplete="email" inputMode="email" required
          hint="Phải trùng với email ở trên." />
        <SelectField name="reason" label={FIELD_LABELS.reason} options={APPEAL_REASONS} required />
        <TextareaField name="statement" label={FIELD_LABELS.statement} required
          minLength={LIMITS.statement.min} maxLength={LIMITS.statement.max}
          hint={`Trình bày ${LIMITS.statement.min}–${LIMITS.statement.max} ký tự.`} />
        <InputField name="evidenceUrl" label={FIELD_LABELS.evidenceUrl} type="url" inputMode="url"
          hint="Tuỳ chọn — URL bắt đầu bằng http:// hoặc https://." />
        <CheckboxField name="acceptTerms"
          label="Tôi cam kết thông tin kháng cáo là trung thực và đồng ý để ban kỷ luật xem xét lại hồ sơ." />

        {submitError && (
          <p className="form-error" role="alert">
            {submitError}
          </p>
        )}

        <button type="submit" className="button" aria-describedby={expired ? 'appeal-expired-note' : undefined}>
          {submitting ? 'Đang gửi…' : 'Gửi kháng cáo'}
        </button>
        {expired && (
          <p id="appeal-expired-note" className="form-error">
            Thời hạn kháng cáo đã kết thúc.
          </p>
        )}
      </form>
    </FormContext.Provider>
  );
}
