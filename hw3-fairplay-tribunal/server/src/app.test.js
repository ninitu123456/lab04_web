import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { loadConfig } from './config.js';

const app = createApp({ clientOrigin: 'http://localhost:5174' });

describe('config', () => {
  it('throws when MONGODB_URI is missing', () => {
    expect(() => loadConfig({})).toThrow(/MONGODB_URI missing/);
  });

  it('applies HW3 defaults for PORT and CLIENT_ORIGIN', () => {
    expect(loadConfig({ MONGODB_URI: 'mongodb://x' })).toEqual({
      mongodbUri: 'mongodb://x',
      port: 4001,
      clientOrigin: 'http://localhost:5174',
    });
  });
});

describe('GET /api/health', () => {
  it('returns ok with CORS for the HW3 client origin', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'http://localhost:5174');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5174');
  });
});

describe('unknown API route / bad JSON', () => {
  it('returns JSON 404', async () => {
    const res = await request(app).get('/api/khong-co');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await request(app).post('/api/health').set('Content-Type', 'application/json').send('{bad');
    expect(res.status).toBe(400);
  });
});
