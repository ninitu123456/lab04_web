import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { EMPTY_APPEAL, validateAppeal } from '../../../shared/appealRules.js';
import { buildSeedDossiers } from '../../scripts/dossiers.data.js';
import { createApp } from '../app.js';
import { Appeal } from '../models/Appeal.js';
import { Dossier } from '../models/Dossier.js';
import { clearTestDb, startTestDb, stopTestDb } from '../test/testDb.js';

const app = createApp({ clientOrigin: 'http://localhost:5174' });
const HOUR = 3_600_000;

const validAppeal = (patch = {}) => ({
  playerId: 'himass',
  appellantName: 'Nguyễn Văn Kháng',
  email: 'Khang@Example.com',
  confirmEmail: 'khang@example.com',
  reason: 'disproportionate-penalty',
  statement: 'Mức phạt 8 trận cho lỗi rời phòng sớm cao gấp đôi mức thông thường của giải nên tôi đề nghị xem xét lại.',
  evidenceUrl: 'https://example.com/vod/42',
  acceptTerms: true,
  ...patch,
});

beforeAll(startTestDb, 120_000);
afterAll(stopTestDb);

beforeEach(async () => {
  await clearTestDb();
  await Dossier.insertMany(buildSeedDossiers());
});

describe('Dossier model', () => {
  it('rejects severity outside 1–5 and unknown playerId', async () => {
    const [base] = buildSeedDossiers();
    await expect(
      Dossier.create({ ...base, playerId: 'tanvuu', offenses: [{ ...base.offenses[0], severity: 6 }] }),
    ).rejects.toThrow(/severity/);
    await expect(Dossier.create({ ...base, playerId: 'faker' })).rejects.toThrow(/playerId/);
  });
});

describe('GET /api/dossiers', () => {
  it('returns a summary list with slaDeadline and offenseCount', async () => {
    const res = await request(app).get('/api/dossiers');
    expect(res.status).toBe(200);
    expect(res.body.map((d) => d.playerId)).toEqual(['himass', 'tanvuu']);
    expect(res.body[0]).toMatchObject({ displayName: 'Himass', offenseCount: 3 });
    expect(res.body[0]).not.toHaveProperty('offenses');
    expect(res.body[0]).not.toHaveProperty('_id');
    const { verdictAt, appealWindowHours, slaDeadline } = res.body[0];
    expect(new Date(slaDeadline).getTime()).toBe(new Date(verdictAt).getTime() + appealWindowHours * HOUR);
  });
});

describe('GET /api/dossiers/:playerId', () => {
  it('returns the full dossier with offenses, evidence and slaDeadline', async () => {
    const res = await request(app).get('/api/dossiers/tanvuu');
    expect(res.status).toBe(200);
    expect(res.body.offenses).toHaveLength(3);
    expect(res.body.offenses[0]).toMatchObject({ code: 'TV-01', severity: 4, penaltyMatches: 10 });
    expect(res.body.offenses[0].evidence[0]).toMatchObject({ kind: 'report' });
    expect(Date.parse(res.body.slaDeadline)).toBeGreaterThan(Date.now());
  });

  it('is case-insensitive on the slug', async () => {
    expect((await request(app).get('/api/dossiers/HiMass')).status).toBe(200);
  });

  it('returns 404 for an unknown player', async () => {
    const res = await request(app).get('/api/dossiers/khong-co');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'dossier not found' });
  });
});

describe('GET /api/time', () => {
  it('returns the server epoch in ms and is not cacheable', async () => {
    const before = Date.now();
    const res = await request(app).get('/api/time');
    expect(res.status).toBe(200);
    expect(res.body.now).toBeGreaterThanOrEqual(before);
    expect(res.body.now).toBeLessThanOrEqual(Date.now());
    expect(res.headers['cache-control']).toBe('no-store');
  });
});

describe('POST /api/appeals', () => {
  it('creates a pending appeal (normalized, without confirmEmail/acceptTerms) → 201', async () => {
    const res = await request(app).post('/api/appeals').send(validAppeal());
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ playerId: 'himass', email: 'khang@example.com', status: 'pending' });
    expect(res.body).not.toHaveProperty('confirmEmail');
    expect(res.body).not.toHaveProperty('acceptTerms');
    expect(await Appeal.countDocuments()).toBe(1);
  });

  describe('validation parity with shared/validateAppeal', () => {
    const badPayloads = {
      'empty form': EMPTY_APPEAL,
      'empty body': {},
      'mismatched confirmEmail': validAppeal({ confirmEmail: 'other@example.com' }),
      'short statement + bad url': validAppeal({ statement: 'quá ngắn', evidenceUrl: 'ftp://x' }),
      'unknown player + bad reason': validAppeal({ playerId: 'faker', reason: 'bored' }),
      'terms not accepted (string "true")': validAppeal({ acceptTerms: 'true' }),
    };

    it.each(Object.entries(badPayloads))('%s → 400 with exactly the client-side errors', async (_label, payload) => {
      const res = await request(app).post('/api/appeals').send(payload);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ errors: validateAppeal(payload) });
      expect(Object.keys(res.body.errors).length).toBeGreaterThan(0);
      expect(await Appeal.countDocuments()).toBe(0);
    });
  });

  it('returns 409 when the SLA window has closed', async () => {
    await Dossier.updateOne({ playerId: 'himass' }, { verdictAt: new Date(Date.now() - 10 * 24 * HOUR) });
    const res = await request(app).post('/api/appeals').send(validAppeal());
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/hết hạn/);
    expect(Date.parse(res.body.slaDeadline)).toBeLessThan(Date.now());
    expect(await Appeal.countDocuments()).toBe(0);
  });

  it('returns 404 when a valid playerId has no dossier in the DB', async () => {
    await Dossier.deleteOne({ playerId: 'tanvuu' });
    const res = await request(app).post('/api/appeals').send(validAppeal({ playerId: 'tanvuu' }));
    expect(res.status).toBe(404);
  });
});

describe('GET /api/appeals', () => {
  it('lists appeals of one dossier, newest first, without e-mail addresses', async () => {
    await request(app).post('/api/appeals').send(validAppeal({ appellantName: 'Người thứ nhất' }));
    await request(app).post('/api/appeals').send(validAppeal({ playerId: 'tanvuu', confirmEmail: 'khang@example.com' }));
    await request(app).post('/api/appeals').send(validAppeal({ appellantName: 'Người thứ hai' }));

    const res = await request(app).get('/api/appeals').query({ playerId: 'himass' });
    expect(res.status).toBe(200);
    expect(res.body.map((a) => a.appellantName)).toEqual(['Người thứ hai', 'Người thứ nhất']);
    expect(res.body[0]).not.toHaveProperty('email');
  });

  it('requires a known playerId', async () => {
    expect((await request(app).get('/api/appeals')).status).toBe(400);
    expect((await request(app).get('/api/appeals').query({ playerId: 'faker' })).status).toBe(400);
  });
});
