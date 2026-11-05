import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/index.js';
import bcrypt from 'bcryptjs';

describe('Real-User Authentication & Session Persistence Tests', () => {
  const uniqueId = Date.now();
  const testUser = {
    email: `real_user_${uniqueId}@devorbit.test`,
    username: `real_user_${uniqueId}`,
    password: 'SecurePassword123!',
    name: 'Real Developer Test',
  };

  let authToken: string;
  let authCookie: string;
  let createdUserId: string;

  // 1. User Registration
  it('1. Successfully registers a new user with bcrypt-hashed credentials and default workspace settings', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.username).toBe(testUser.username);
    expect(res.body.data.user.name).toBe(testUser.name);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.preference).toBeDefined();

    createdUserId = res.body.data.user.id;
    authToken = res.body.data.token;

    // Verify httpOnly cookie was set in response
    const setCookieHeader = res.headers['set-cookie'];
    expect(setCookieHeader).toBeDefined();
    const cookieStr = Array.isArray(setCookieHeader) ? setCookieHeader.join('; ') : setCookieHeader;
    expect(cookieStr).toContain('devorbit_token=');
    expect(cookieStr).toContain('HttpOnly');
    authCookie = cookieStr;

    // Verify password is not plaintext in SQLite database
    const dbUser = await prisma.user.findUnique({ where: { id: createdUserId } });
    expect(dbUser).toBeDefined();
    expect(dbUser!.passwordHash).not.toBe(testUser.password);
    const isBcryptMatch = await bcrypt.compare(testUser.password, dbUser!.passwordHash);
    expect(isBcryptMatch).toBe(true);
  });

  // 2. Duplicate Registration Prevention
  it('2. Prevents duplicate registrations with structured 400 error', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toMatch(/already registered|already taken/i);
  });

  // 3. Password Length & Schema Validation
  it('3. Rejects registration with password shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `short_pw_${uniqueId}@devorbit.test`,
        username: `short_pw_${uniqueId}`,
        password: 'short',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 4. Login with Username & Email
  it('4. Allows registered user to log in using either username or email', async () => {
    // Login with username
    const userRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ login: testUser.username, password: testUser.password });

    expect(userRes.status).toBe(200);
    expect(userRes.body.success).toBe(true);
    expect(userRes.body.data.user.username).toBe(testUser.username);
    expect(userRes.body.data.token).toBeDefined();

    // Login with email
    const emailRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ login: testUser.email, password: testUser.password });

    expect(emailRes.status).toBe(200);
    expect(emailRes.body.success).toBe(true);
    expect(emailRes.body.data.user.email).toBe(testUser.email);
  });

  // 5. Invalid Credentials Rejection
  it('5. Rejects incorrect password with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ login: testUser.username, password: 'WrongPassword999!' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toMatch(/invalid credentials/i);
  });

  // 6. Session Persistence & /auth/me with Bearer Token
  it('6. Validates active session via /api/v1/auth/me using Bearer authorization header', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdUserId);
    expect(res.body.data.username).toBe(testUser.username);
  });

  // 7. Session Persistence & /auth/me with Cookie
  it('7. Validates active session via /api/v1/auth/me using devorbit_token cookie', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', `devorbit_token=${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdUserId);
    expect(res.body.data.username).toBe(testUser.username);
  });

  // 8. Logout & Session Invalidation
  it('8. Successfully logs out, destroys the session in SQLite, and clears the authentication cookie', async () => {
    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${authToken}`);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    // Verify session was destroyed
    const sessionInDb = await prisma.session.findUnique({ where: { token: authToken } });
    expect(sessionInDb).toBeNull();

    // Verify cookie was cleared
    const clearCookieHeader = logoutRes.headers['set-cookie'];
    if (clearCookieHeader) {
      const cookieStr = Array.isArray(clearCookieHeader) ? clearCookieHeader.join('; ') : clearCookieHeader;
      expect(cookieStr).toMatch(/devorbit_token=;.*expires=/i);
    }

    // Subsequent access with revoked token is rejected with 401
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(meRes.status).toBe(401);
  });
});
