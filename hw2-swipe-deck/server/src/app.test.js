import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { loadConfig } from './config.js';

const app = createApp({ clientOrigin: 'http://localhost:5173' });

describe('config', () => {
  it('throws when MONGODB_URI is missing', () => {
    expect(() => loadConfig({})).toThrow(/MONGODB_URI missing/);
  });

  it('applies defaults for PORT and CLIENT_ORIGIN', () => {
    expect(loadConfig({ MONGODB_URI: 'mongodb://x' })).toEqual({
      mongodbUri: 'mongodb://x',
      port: 4000,
      clientOrigin: 'http://localhost:5173',
    });
  });
});

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('sends CORS header only for the allowed client origin', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });
});

describe('unknown API route', () => {
  it('returns JSON 404', async () => {
    const res = await request(app).get('/api/khong-co');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });
});