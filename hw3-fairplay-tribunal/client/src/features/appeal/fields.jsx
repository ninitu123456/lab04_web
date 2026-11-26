import { useId } from 'react';
import { useFormContext } from './FormContext.js';

/**
 * Phần dùng chung của mọi field: id (useId), hint, lỗi role="alert",
 * aria-invalid + aria-describedby trỏ tới hint/lỗi.
 * @param {import('./FormContext.js').FieldName} name
 * @param {boolean} hasHint
 */
function useFieldA11y(name, hasHint) {
  const id = useId();
  const { errorFor } = useFormContext();
  const error = errorFor(name);
  const hintId = hasHint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return {
    id,
    error,
    hintId,
    errorId,
    inputProps: {
      id,
      name,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
    },
  };
}

function FieldMessages({ hint, hintId, error, errorId }) {
  return (
    <>
      {hint && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field__error" role="alert">
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
    </>
  );
}

/**
 * @param {{ name: import('./FormContext.js').FieldName, label: string, type?: string, hint?: string,
 *           autoComplete?: string, required?: boolean, inputMode?: string }} props
 */
export function InputField({ name, label, type = 'text', hint, autoComplete, required = false, inputMode }) {
  const { values, setValue, markTouched } = useFormContext();
  const { id, error, hintId, errorId, inputProps } = useFieldA11y(name, Boolean(hint));
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label}
        {required && <span className="field__required"> (bắt buộc)</span>}
      </label>
      <input
        {...inputProps}
        className="field__control"
        type={type}
        value={String(values[name] ?? '')}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        onChange={(e) => setValue(name, e.target.value)}
        onBlur={() => markTouched(name)}
      />
      <FieldMessages hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
}

/**
 * @param {{ name: import('./FormContext.js').FieldName, label: string, hint?: string, required?: boolean,
 *           placeholder?: string, options: readonly { value: string, label: string }[] }} props
 */
export function SelectField({ name, label, hint, required = false, placeholder = '— Chọn —', options }) {
  const { values, setValue, markTouched } = useFormContext();
  const { id, error, hintId, errorId, inputProps } = useFieldA11y(name, Boolean(hint));
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label}
        {required && <span className="field__required"> (bắt buộc)</span>}
      </label>
      <select
        {...inputProps}
        className="field__control"
        value={String(values[name] ?? '')}
        required={required}
        onChange={(e) => setValue(name, e.target.value)}
        onBlur={() => markTouched(name)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <FieldMessages hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
}

/**
 * Textarea có bộ đếm ký tự (aria-live="polite").
 * @param {{ name: import('./FormContext.js').FieldName, label: string, hint?: string, required?: boolean,
 *           minLength?: number, maxLength?: number, rows?: number }} props
 */
export function TextareaField({ name, label, hint, required = false, minLength, maxLength, rows = 6 }) {
  const { values, setValue, markTouched } = useFormContext();
  const { id, error, hintId, errorId, inputProps } = useFieldA11y(name, Boolean(hint));
  const value = String(values[name] ?? '');
  const length = value.trim().length;
  const counterId = `${id}-counter`;
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label}
        {required && <span className="field__required"> (bắt buộc)</span>}
      </label>
      <textarea
        {...inputProps}
        aria-describedby={[inputProps['aria-describedby'], counterId].filter(Boolean).join(' ')}
        className="field__control"
        rows={rows}
        value={value}
        required={required}
        onChange={(e) => setValue(name, e.target.value)}
        onBlur={() => markTouched(name)}
      />
      <p id={counterId} className="field__counter" aria-live="polite">
        {length}
        {maxLength ? `/${maxLength}` : ''} ký tự{minLength && length < minLength ? ` — cần thêm ${minLength - length}` : ''}
      </p>
      <FieldMessages hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
}

/** @param {{ name: import('./FormContext.js').FieldName, label: string, hint?: string }} props */
export function CheckboxField({ name, label, hint }) {
  const { values, setValue, markTouched } = useFormContext();
  const { id, error, hintId, errorId, inputProps } = useFieldA11y(name, Boolean(hint));
  return (
    <div className="field field--checkbox">
      <div className="field__check-row">
        <input
          {...inputProps}
          className="field__checkbox"
          type="checkbox"
          checked={values[name] === true}
          onChange={(e) => setValue(name, e.target.checked)}
          onBlur={() => markTouched(name)}
        />
        <label htmlFor={id} className="field__label">
          {label}
        </label>
      </div>
      <FieldMessages hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
}
