import { describe, expect, it } from 'vitest';
import {
  APPEAL_FIELDS,
  APPEAL_REASONS,
  EMPTY_APPEAL,
  LIMITS,
  PLAYER_IDS,
  isValid,
  normalizeAppeal,
  validateAppeal,
} from './appealRules.js';

/** Payload hợp lệ đầy đủ — mỗi test chỉ làm hỏng đúng 1 field. */
const valid = () => ({
  playerId: 'himass',
  appellantName: 'Nguyễn Văn Kháng',
  email: 'khang@example.com',
  confirmEmail: 'KHANG@example.com',
  reason: 'disproportionate-penalty',
  statement: 'Tôi đề nghị xem xét lại vì mức phạt cao hơn nhiều so với các trường hợp tương tự trước đây.',
  evidenceUrl: 'https://example.com/vod/123',
  acceptTerms: true,
});

const errorFor = (field, value) => validateAppeal({ ...valid(), [field]: value })[field];

describe('contract constants', () => {
  it('exposes the two dossiers, four reasons and the form field order', () => {
    expect(PLAYER_IDS).toEqual(['himass', 'tanvuu']);
    expect(APPEAL_REASONS.map((r) => r.value)).toEqual([
      'evidence-error',
      'disproportionate-penalty',
      'procedural-violation',
      'other',
    ]);
    expect(APPEAL_FIELDS).toEqual(Object.keys(EMPTY_APPEAL));
    expect(Object.isFrozen(LIMITS.statement)).toBe(true);
  });
});

describe('validateAppeal', () => {
  it('returns {} for a fully valid payload', () => {
    expect(validateAppeal(valid())).toEqual({});
    expect(isValid(validateAppeal(valid()))).toBe(true);
  });

  it('flags every required field on an empty form (evidenceUrl is optional)', () => {
    const errors = validateAppeal(EMPTY_APPEAL);
    expect(Object.keys(errors).sort()).toEqual(
      ['playerId', 'appellantName', 'email', 'confirmEmail', 'reason', 'statement', 'acceptTerms'].sort(),
    );
  });

  it('never throws on garbage input', () => {
    for (const input of [null, undefined, 42, 'x', [], { email: 5, acceptTerms: 'true' }]) {
      expect(() => validateAppeal(input)).not.toThrow();
    }
    expect(validateAppeal({ acceptTerms: 'true' }).acceptTerms).toBeDefined();
  });

  describe('playerId', () => {
    it('is required and must be a known dossier', () => {
      expect(errorFor('playerId', '')).toMatch(/chọn hồ sơ/);
      expect(errorFor('playerId', 'faker')).toMatch(/không tồn tại/);
      expect(errorFor('playerId', ' tanvuu ')).toBeUndefined();
    });
  });

  describe('appellantName', () => {
    it('enforces 2–60 characters after trimming', () => {
      expect(errorFor('appellantName', '   ')).toMatch(/vui lòng nhập/i);
      expect(errorFor('appellantName', ' A ')).toMatch(/ít nhất 2/);
      expect(errorFor('appellantName', 'AB')).toBeUndefined();
      expect(errorFor('appellantName', 'x'.repeat(60))).toBeUndefined();
      expect(errorFor('appellantName', 'x'.repeat(61))).toMatch(/tối đa 60/);
    });
  });

  describe('email', () => {
    it.each(['abc', 'abc@', 'a@b', 'a b@c.com', '@example.com'])('rejects %j', (email) => {
      expect(errorFor('email', email)).toMatch(/định dạng/);
    });
    it('is required', () => {
      expect(errorFor('email', '')).toMatch(/nhập email/);
    });
  });

  describe('confirmEmail (cross-field)', () => {
    it('must match email, case-insensitively', () => {
      expect(errorFor('confirmEmail', '')).toMatch(/nhập lại/);
      expect(errorFor('confirmEmail', 'other@example.com')).toMatch(/không khớp/);
      expect(errorFor('confirmEmail', ' Khang@Example.com ')).toBeUndefined();
    });

    it('re-evaluates when only the email changes', () => {
      const errors = validateAppeal({ ...valid(), email: 'new@example.com' });
      expect(errors.email).toBeUndefined();
      expect(errors.confirmEmail).toMatch(/không khớp/);
    });
  });

  describe('reason', () => {
    it('must be one of the enum values', () => {
      expect(errorFor('reason', '')).toMatch(/chọn lý do/);
      expect(errorFor('reason', 'bored')).toMatch(/không hợp lệ/);
      for (const { value } of APPEAL_REASONS) expect(errorFor('reason', value)).toBeUndefined();
    });
  });

  describe('statement', () => {
    it('enforces 50–2000 characters and reports the current length', () => {
      expect(errorFor('statement', '')).toMatch(/trình bày/);
      expect(errorFor('statement', 'x'.repeat(49))).toMatch(/ít nhất 50 ký tự \(hiện có 49\)/);
      expect(errorFor('statement', 'x'.repeat(50))).toBeUndefined();
      expect(errorFor('statement', 'x'.repeat(2000))).toBeUndefined();
      expect(errorFor('statement', 'x'.repeat(2001))).toMatch(/tối đa 2000/);
    });
  });

  describe('evidenceUrl', () => {
    it('is optional but must be http(s) when present', () => {
      expect(errorFor('evidenceUrl', '')).toBeUndefined();
      expect(errorFor('evidenceUrl', undefined)).toBeUndefined();
      expect(errorFor('evidenceUrl', 'http://example.com')).toBeUndefined();
      expect(errorFor('evidenceUrl', 'example.com')).toMatch(/http/);
      expect(errorFor('evidenceUrl', 'javascript:alert(1)')).toMatch(/http/);
      expect(errorFor('evidenceUrl', 'ftp://example.com/file')).toMatch(/http/);
    });
  });

  describe('acceptTerms', () => {
    it('must be exactly true', () => {
      expect(errorFor('acceptTerms', false)).toMatch(/xác nhận/);
      expect(errorFor('acceptTerms', 'true')).toMatch(/xác nhận/);
      expect(errorFor('acceptTerms', true)).toBeUndefined();
    });
  });
});

describe('normalizeAppeal', () => {
  it('trims, lowercases email and drops confirmEmail / acceptTerms', () => {
    const out = normalizeAppeal({ ...valid(), appellantName: '  Nguyễn Văn Kháng  ', email: ' KHANG@Example.com ' });
    expect(out).toEqual({
      playerId: 'himass',
      appellantName: 'Nguyễn Văn Kháng',
      email: 'khang@example.com',
      reason: 'disproportionate-penalty',
      statement: valid().statement,
      evidenceUrl: 'https://example.com/vod/123',
    });
  });

  it('omits an empty evidenceUrl', () => {
    expect(normalizeAppeal({ ...valid(), evidenceUrl: '  ' })).not.toHaveProperty('evidenceUrl');
  });
});
