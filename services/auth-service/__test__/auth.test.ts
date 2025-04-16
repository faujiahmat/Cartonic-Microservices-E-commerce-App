import request from 'supertest';
import app from '../src/app';

describe('Auth Service Test', () => {
  const randomNumber = Math.floor(Math.random() * 1000);
  let userData: { email: string; name: string; password: string };
  let accessToken: string;
  let refreshToken: string;

  const generateUserData = () => ({
    email: `user${randomNumber}@gmail.com`,
    name: `user${randomNumber}`,
    password: `user${randomNumber}`,
    confirmPassword: `user${randomNumber}`,
  });

  describe('Halaman Tidak Ditemukan', () => {
    it('harus mengembalikan 404', async () => {
      const response = await request(app).get('/random-url');
      expect(response.status).toBe(404);
      expect(response.body.message).toEqual('Halaman tidak ditemukan');
    });
  });

  describe('Register User', () => {
    beforeAll(async () => {
      userData = generateUserData();

      await request(app).post('/auth/register').send(userData);

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({ email: userData.email, password: userData.password });

      accessToken = loginResponse.body.data.token;
      refreshToken = loginResponse.headers['set-cookie'];
    });

    it('harus berhasil dengan data valid', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: `user${randomNumber + 1}@gmail.com`,
          name: `user${randomNumber + 1}`,
          password: `user${randomNumber + 1}`,
          confirmPassword: `user${randomNumber + 1}`,
        });
      expect(response.status).toBe(201);
      expect(response.body.message).toEqual('register berhasil');
    });

    it('gagal jika data tidak valid', async () => {
      const response = await request(app).post('/auth/register').send({
        email: userData.email,
        name: userData.name,
        password: 'pass123',
        confirmPassword: 'pass321', // Salah
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toEqual('Input data gagal');
    });

    it('gagal jika email sudah terdaftar', async () => {
      const response = await request(app).post('/auth/register').send(userData);
      expect(response.status).toBe(400);
      expect(response.body.message).toEqual('Email sudah terdaftar');
    });
  });

  describe('Login User', () => {
    it.each([
      {
        email: '',
        password: 'randompass',
        expectedStatus: 400,
        expectedMessage: 'Input data gagal',
      },
      {
        email: 'wronguser@gmail.com',
        password: 'randompass',
        expectedStatus: 404,
        expectedMessage: 'Email atau password salah',
      },
      {
        email: generateUserData().email,
        password: 'wrongpass',
        expectedStatus: 400,
        expectedMessage: 'Email atau password salah',
      },
    ])(
      'gagal login dengan data tidak valid',
      async ({ email, password, expectedStatus, expectedMessage }) => {
        const response = await request(app).post('/auth/login').send({ email, password });
        expect(response.status).toBe(expectedStatus);
        expect(response.body.message).toEqual(expectedMessage);
      },
    );

    it('berhasil login dengan data valid', async () => {
      const response = await request(app).post('/auth/login').send({
        email: generateUserData().email,
        password: userData.password,
      });
      expect(response.status).toBe(200);
      expect(response.body.message).toEqual('Login berhasil');
    });
  });

  describe('Refresh Token', () => {
    beforeAll(async () => {
      userData = generateUserData();

      await request(app).post('/auth/register').send(userData);

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({ email: userData.email, password: userData.password });

      accessToken = loginResponse.body.data.token;
      refreshToken = loginResponse.headers['set-cookie'];
    });

    it('berhasil memperbarui token', async () => {
      const response = await request(app).get('/auth/refresh-token').set('Cookie', refreshToken);

      expect(response.status).toBe(200);
      expect(response.body.message).toEqual('Access token diperbarui');
    });

    it('gagal jika refresh token tidak ditemukan', async () => {
      const response = await request(app)
        .get('/auth/refresh-token')
        .set('Cookie', ['refreshToken=']);
      expect(response.status).toBe(404);
      expect(response.body.message).toEqual('Refresh token tidak ditemukan');
    });
  });

  describe('Logout', () => {
    it('berhasil logout', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', refreshToken);

      expect(response.status).toBe(200);
      expect(response.body.message).toEqual('Logout berhasil');
    });

    it('gagal logout jika tidak ada token', async () => {
      const response = await request(app).post('/auth/logout');
      expect(response.status).toBe(401);
      expect(response.body.message).toEqual('Unauthorized, token missing');
    });
  });
});
