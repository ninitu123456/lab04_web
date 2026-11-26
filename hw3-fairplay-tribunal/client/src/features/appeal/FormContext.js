import { createContext, useContext } from 'react';

/**
 * FORM CONTEXT CONTRACT — cầu nối giữa <AppealForm> (Provider) và các field.
 * @typedef {import('@shared/appealRules.js').AppealInput} AppealInput
 * @typedef {keyof AppealInput} FieldName
 * @typedef {{
 *   values: AppealInput,
 *   setValue: (name: FieldName, value: AppealInput[FieldName]) => void,
 *   markTouched: (name: FieldName) => void,
 *   errorFor: (name: FieldName) => string | undefined,
 * }} FormContextValue
 */

/** @type {import('react').Context<FormContextValue | null>} */
export const FormContext = createContext(/** @type {FormContextValue | null} */ (null));

/**
 * Dùng trong field con. Throw nếu nằm ngoài Provider → lỗi lập trình lộ ra ngay thay vì âm thầm undefined.
 * @returns {FormContextValue}
 */
export function useFormContext() {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error('useFormContext() phải được dùng bên trong <AppealForm> (FormContext.Provider).');
  return ctx;
}
