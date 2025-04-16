import request from 'supertest';
import app from '../src/app';
import User from '../src/models/user.model';
import { describe, it, expect, afterEach, beforeEach } from '@jest/globals';
import { generateToken } from '../src/utils/jwt';

// Cleanup setelah setiap pengujian
afterEach(async () => {
  await User.deleteMany({ email: 'fauji123@gmail.com' });
});

// ----------------------------------
// UJI COBA HALAMAN TIDAK DITEMUKAN
// ----------------------------------
describe('Test Halaman Tidak Ditemukan', () => {
  it('Harus mengembalikan 404 jika rute tidak ditemukan', async () => {
    const response = await request(app).get('/random-route');
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual('Halaman tidak ditemukan');
  });
});

// ----------------------------------
// UJI COBA LOGIN
// ----------------------------------
describe('User Login Tests', () => {
  const loginTestCases = [
    {
      description: 'User login dengan data valid',
      requestData: { email: 'fauji1@gmail.com', password: 'fauji' },
      expectedStatus: 200,
      expectedMessage: 'Login berhasil',
    },
    {
      description: 'User login dengan email tidak valid',
      requestData: { email: 'fauji01@gmail.com', password: 'fauji' },
      expectedStatus: 404,
      expectedMessage: 'Email atau password salah',
    },
    {
      description: 'User login dengan password salah',
      requestData: { email: 'fauji1@gmail.com', password: 'wrongpass' },
      expectedStatus: 400,
      expectedMessage: 'Email atau password salah',
    },
  ];

  loginTestCases.forEach(({ description, requestData, expectedStatus, expectedMessage }) => {
    it(description, async () => {
      const response = await request(app).post('/users/login').send(requestData);
      expect(response.status).toBe(expectedStatus);
      expect(response.body.message).toBe(expectedMessage);
    });
  });
});

// ----------------------------------
// UJI COBA REGISTRASI
// ----------------------------------
describe('User Registration Tests', () => {
  it('Harus berhasil mendaftarkan user dengan data valid', async () => {
    const response = await request(app).post('/users/register').send({
      email: 'fauji123@gmail.com',
      name: 'fauji',
      password: 'fauji',
      confirmPassword: 'fauji',
    });
    expect(response.status).toBe(201);
    expect(response.body.message).toEqual('register berhasil');
  });

  it('Gagal mendaftar jika data tidak valid', async () => {
    const response = await request(app).post('/users/register').send({
      name: '',
      email: 'fauji123@gmail.com',
      password: '12345',
      confirmPassword: '123456',
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Input data gagal');
  });

  it('Gagal mendaftar jika email sudah terdaftar', async () => {
    await request(app).post('/users/register').send({
      email: 'fauji123@gmail.com',
      name: 'fauji',
      password: 'fauji',
      confirmPassword: 'fauji',
    });

    const response = await request(app).post('/users/register').send({
      email: 'fauji123@gmail.com',
      name: 'fauji',
      password: 'fauji',
      confirmPassword: 'fauji',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Email sudah terdaftar');
  });
});

// ----------------------------------
// UJI COBA MELIHAT PROFIL
// ----------------------------------
describe('User Profile Tests', () => {
  let token: string;

  beforeEach(async () => {
    await request(app).post('/users/register').send({
      email: 'fauji123@gmail.com',
      name: 'fauji',
      password: 'fauji',
      confirmPassword: 'fauji',
    });

    const loginResponse = await request(app).post('/users/login').send({
      email: 'fauji123@gmail.com',
      password: 'fauji',
    });

    token = loginResponse.body.data.token;
  });

  it('Berhasil melihat profil dengan token valid', async () => {
    const response = await request(app)
      .get('/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Data pengguna berhasil didapatkan');
  });

  it('Gagal melihat profil dengan token tidak valid', async () => {
    const fakeToken = generateToken({ user_id: '123', role: 'user' });

    const response = await request(app)
      .get('/users/profile')
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Session expired, please login again');
  });
});

// ----------------------------------
// UJI COBA UPDATE USER
// ----------------------------------
describe('User Update Tests', () => {
  let token: string;

  beforeEach(async () => {
    await request(app).post('/users/register').send({
      email: 'fauji123@gmail.com',
      name: 'fauji',
      password: 'fauji',
      confirmPassword: 'fauji',
    });

    const loginResponse = await request(app).post('/users/login').send({
      email: 'fauji123@gmail.com',
      password: 'fauji',
    });

    token = loginResponse.body.data.token;
  });

  it('Berhasil mengupdate user dengan data valid', async () => {
    const response = await request(app)
      .patch('/users/profile')
      .send({
        email: 'fauji123@gmail.com',
        name: 'fauji123',
        password: 'fauji',
        confirmPassword: 'fauji',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Data pengguna berhasil diupdate');
  });

  it('Gagal mengupdate user jika data tidak valid', async () => {
    const response = await request(app)
      .patch('/users/profile')
      .send({
        email: 'fauji123@gmail.com',
        name: '',
        password: 'fauji',
        confirmPassword: 'fauji',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Update data gagal');
  });

  it('Gagal mengupdate user jika email sudah terdaftar', async () => {
    const response = await request(app)
      .patch('/users/profile')
      .send({
        email: 'fauji1@gmail.com',
        name: 'fauji',
        password: 'fauji',
        confirmPassword: 'fauji',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Email sudah terdaftar');
  });
});
// ----------------------------------
// UJI COBA DELETE USER
// ----------------------------------
describe('User Delete Tests', () => {
  let token: string;

  beforeEach(async () => {
    await request(app).post('/users/register').send({
      email: 'fauji123@gmail.com',
      name: 'fauji',
      password: 'fauji',
      confirmPassword: 'fauji',
    });

    const loginResponse = await request(app).post('/users/login').send({
      email: 'fauji123@gmail.com',
      password: 'fauji',
    });

    token = loginResponse.body.data.token;
  });

  it('Berhasil menghapus user dengan token valid', async () => {
    const response = await request(app)
      .delete('/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('User berhasil dihapus');
  });

  it('Gagal menghapus user dengan token tidak valid', async () => {
    const fakeToken = generateToken({ user_id: '123', role: 'user' });

    const response = await request(app)
      .delete('/users/profile')
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Session expired, please login again');
  });
});

// ----------------------------------
// UJI COBA GET REFRESH TOKEN
// ----------------------------------
describe('User Refresh Token Tests', () => {
  let token: string;
  let id: string;

  beforeEach(async () => {
    await request(app).post('/users/register').send({
      email: 'fauji123@gmail.com',
      role: 'admin',
      name: 'fauji',
      password: 'fauji',
      confirmPassword: 'fauji',
    });

    const loginResponse = await request(app).post('/users/login').send({
      email: 'fauji123@gmail.com',
      password: 'fauji',
    });

    token = loginResponse.body.data.token;
    id = loginResponse.body.data.user_id;
  });

  it('Berhasil mendapatkan refresh token dengan token valid', async () => {
    const response = await request(app)
      .get(`/users/${id}/refresh-token`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Access token diperbarui');
  });

  it('Gagal mendapatkan refresh token jika token tidak valid', async () => {
    const fakeToken = generateToken({ user_id: '123', role: 'user' });

    const response = await request(app)
      .get('/users/123/refresh-token')
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toEqual('Forbidden');
  });

  it('Gagal mendapatkan refresh token jika ID tidak valid', async () => {
    const response = await request(app)
      .get('/users/123/refresh-token')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual('User tidak ditemukan');
  });
});

// ----------------------------------
// UJI COBA LOGOUT
// ----------------------------------
describe('User Logout Tests', () => {
  let id: string;

  beforeEach(async () => {
    await request(app).post('/users/register').send({
      email: 'fauji123@gmail.com',
      role: 'admin',
      name: 'fauji',
      password: 'fauji',
      confirmPassword: 'fauji',
    });

    const loginResponse = await request(app).post('/users/login').send({
      email: 'fauji123@gmail.com',
      password: 'fauji',
    });

    id = loginResponse.body.data.user_id;
  });

  it('Berhasil logout dengan token valid', async () => {
    const response = await request(app).get(`/users/${id}/logout`);
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Logout berhasil');
  });

  it('Gagal logout jika ID tidak valid', async () => {
    const response = await request(app).get('/users/123/logout');
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual('User tidak ditemukan');
  });
});
