import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { Profile } from '../models/Profile.js';
import { Swipe } from '../models/Swipe.js';
import { clearTestDb, startTestDb, stopTestDb } from '../test/testDb.js';

const app = createApp({ clientOrigin: 'http://localhost:5173' });
const SESSION = 'session-test-1';

/** @type {Array<{ _id: import('mongoose').Types.ObjectId }>} */
let profiles;

beforeAll(startTestDb, 120_000);
afterAll(stopTestDb);

beforeEach(async () => {
  await clearTestDb();
  profiles = await Profile.insertMany([
    { name: 'Nhân vật A', age: 24, bio: 'a', interests: ['x'], avatar: '/avatars/a.svg' },
    { name: 'Nhân vật B', age: 30, bio: 'b', interests: [], avatar: '/avatars/b.svg' },
  ]);
});

describe('Profile model', () => {
  it('rejects age outside 18–99', async () => {
    await expect(Profile.create({ name: 'Nhỏ', age: 17, avatar: '/a.svg' })).rejects.toThrow(/age/);
    await expect(Profile.create({ name: 'Già', age: 100, avatar: '/a.svg' })).rejects.toThrow(/age/);
  });
});

describe('GET /api/profiles', () => {
  it('returns all profiles as plain JSON in creation order', async () => {
    const res = await request(app).get('/api/profiles');
    expect(res.status).toBe(200);
    expect(res.body.map((p) => p.name)).toEqual(['Nhân vật A', 'Nhân vật B']);
    expect(res.body[0]).toMatchObject({ age: 24, interests: ['x'], avatar: '/avatars/a.svg' });
    expect(res.body[0]._id).toBe(String(profiles[0]._id));
  });
});

describe('POST /api/swipe', () => {
  const valid = () => ({ sessionId: SESSION, profileId: String(profiles[0]._id), direction: 'LIKE' });

  it('creates a swipe and returns 201', async () => {
    const res = await request(app).post('/api/swipe').send(valid());
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ sessionId: SESSION, direction: 'LIKE', profileId: valid().profileId });
    expect(res.body._id).toBeTruthy();
    expect(await Swipe.countDocuments()).toBe(1);
  });

  it.each([
    ['missing sessionId', { sessionId: undefined }, /sessionId/],
    ['missing profileId', { profileId: undefined }, /profileId/],
    ['missing direction', { direction: undefined }, /direction/],
    ['invalid direction', { direction: 'MAYBE' }, /direction/],
    ['malformed profileId', { profileId: 'not-an-id' }, /ObjectId/],
    ['unknown profile', { profileId: String(new mongoose.Types.ObjectId()) }, /not found/],
  ])('returns 400 JSON for %s', async (_label, patch, message) => {
    const res = await request(app).post('/api/swipe').send({ ...valid(), ...patch });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(message);
    expect(await Swipe.countDocuments()).toBe(0);
  });

  it('returns 400 for a malformed JSON body', async () => {
    const res = await request(app).post('/api/swipe').set('Content-Type', 'application/json').send('{bad');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid JSON body' });
  });
});

describe('GET /api/swipes', () => {
  it('returns only this session history, oldest first', async () => {
    await Swipe.create({ sessionId: SESSION, profileId: profiles[0]._id, direction: 'NOPE' });
    await Swipe.create({ sessionId: 'other-session', profileId: profiles[0]._id, direction: 'LIKE' });
    await Swipe.create({ sessionId: SESSION, profileId: profiles[1]._id, direction: 'SUPER' });

    const res = await request(app).get('/api/swipes').query({ sessionId: SESSION });
    expect(res.status).toBe(200);
    expect(res.body.map((s) => s.direction)).toEqual(['NOPE', 'SUPER']);
    expect(res.body.map((s) => s.profileId)).toEqual([String(profiles[0]._id), String(profiles[1]._id)]);
  });

  it('requires sessionId', async () => {
    const res = await request(app).get('/api/swipes');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/sessionId/);
  });
});

describe('DELETE /api/swipe/:id', () => {
  it('deletes the swipe and returns 204', async () => {
    const swipe = await Swipe.create({ sessionId: SESSION, profileId: profiles[0]._id, direction: 'LIKE' });
    const res = await request(app).delete(`/api/swipe/${swipe._id}`);
    expect(res.status).toBe(204);
    expect(await Swipe.findById(swipe._id)).toBeNull();
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).delete(`/api/swipe/${new mongoose.Types.ObjectId()}`);
    expect(res.status).toBe(404);
  });

  it('returns 404 for a malformed id', async () => {
    const res = await request(app).delete('/api/swipe/abc');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/);
  });
});
