import { useEffect, useRef } from 'react';

/**
 * Kết quả gửi — KHÔNG bao giờ reject (không có unhandled promise rejection).
 * @typedef {{ status: 'created', data: object }
 *   | { status: 'invalid', errors: Record<string, string> }
 *   | { status: 'expired', message: string }
 *   | { status: 'error', message: string }
 *   | { status: 'aborted' }} SubmitResult
 */

/**
 * POST /api/appeals với AbortController.
 * useEffect DUY NHẤT ở đây là để đồng bộ với hệ thống ngoài (network): hủy request khi unmount.
 * Engine form (FormContext / AppealForm / fields) không có useEffect nào.
 */
export function useAppealSubmit() {
  const controllerRef = useRef(/** @type {AbortController | null} */ (null));

  useEffect(() => () => controllerRef.current?.abort(), []);

  /**
   * @param {object} values
   * @returns {Promise<SubmitResult>}
   */
  const submit = async (values) => {
    controllerRef.current?.abort(); // hủy lần gửi trước nếu còn treo
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      const res = await fetch('/api/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        signal: controller.signal,
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 201) return { status: 'created', data: body };
      if (res.status === 400 && body.errors) return { status: 'invalid', errors: body.errors };
      if (res.status === 409) return { status: 'expired', message: body.error ?? 'Đã hết hạn kháng cáo.' };
      return { status: 'error', message: body.error ?? `Máy chủ trả về lỗi ${res.status}` };
    } catch (err) {
      if (controller.signal.aborted) return { status: 'aborted' };
      return { status: 'error', message: err instanceof Error ? err.message : String(err) };
    }
  };

  return submit;
}
