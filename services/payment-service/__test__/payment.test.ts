import request from 'supertest';
import app from '../src/app';
import { describe, it, expect, afterAll, beforeAll } from '@jest/globals';
import { generateToken } from '../src/utils/jwt';

let token: string;
let category: any;
let product: any;
let order: any;

beforeAll(async () => {
  token = generateToken({
    user_id: '1234567890',
    role: 'admin',
  });

  category = await request('http://localhost:6001')
    .post('/products/categories')
    .send({
      name: 'Category testing',
    })
    .set('Authorization', `Bearer ${token}`);

  product = await request('http://localhost:6001')
    .post('/products')
    .send({
      name: 'Produk Test',
      price: 10000,
      stock: 10,
      category: [category?.body.data._id],
      images: ['https://example.com/image.jpg'],
      description: 'Deskripsi produk test',
    })
    .set('Authorization', `Bearer ${token}`);

  order = await request('http://localhost:6005')
    .post('/orders')
    .send({
      items: [
        {
          productId: product?.body.data.product_id,
          quantity: 2,
        },
      ],
    })
    .set('Authorization', `Bearer ${token}`);
});

afterAll(async () => {
  await request('http://localhost:6001')
    .delete(`/products/categories/${category?.body.data.category_id}`)
    .set('Authorization', `Bearer ${token}`);
  await request('http://localhost:6001')
    .delete(`/products/${product?.body.data.product_id}`)
    .set('Authorization', `Bearer ${token}`);
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
// UJI COBA CREATE PAYMENT
// ----------------------------------
let payment: any;
describe('Test Create Payment', () => {
  it('Gagal membuat pembayaran karena bukan admin', async () => {
    const fakeToken = generateToken({
      user_id: '1234567890',
      role: 'user',
    });

    const response = await request(app)
      .post('/payments')
      .send({
        orderId: '1234567890',
        payment_method: 'credit_card',
        amount: 100000,
      })
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Anda tidak memiliki akses');
  });

  it('Gagal membuat pembayaran karena input tidak valid', async () => {
    const response = await request(app)
      .post('/payments')
      .send({
        orderId: '1234567890',
        payment_method: 'credit_card',
        amount: -100000,
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Input data gagal');
  });

  it('Berhasil membuat pembayaran', async () => {
    payment = await request(app)
      .post('/payments')
      .send({
        orderId: order?.body.data.id,
        paymentMethod: 'credit_card',
        amount: 100000,
        status: 'PAID',
      })
      .set('Authorization', `Bearer ${token}`);

    console.log(payment.body);
    expect(payment.status).toBe(201);
    expect(payment.body.message).toBe('Pembayaran berhasil');
  });
});

// ----------------------------------
// UJI COBA GET PAYMENT
// ----------------------------------
describe('Test Get Payment', () => {
  it('Gagal mendapatkan pembayaran karena bukan admin', async () => {
    const fakeToken = generateToken({
      user_id: '1234567890',
      role: 'user',
    });

    const response = await request(app)
      .get('/payments/1234567890')
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Anda tidak memiliki akses');
  });

  it('Gagal mendapatkan pembayaran karena pembayaran tidak ditemukan', async () => {
    const response = await request(app)
      .get('/payments/invalid-id')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Pembayaran tidak ditemukan');
  });

  it('Berhasil mendapatkan pembayaran', async () => {
    const response = await request(app)
      .get(`/payments/${payment?.body.data.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Pembayaran ditemukan');
  });
});

// ----------------------------------
// UJI COBA UPDATE PAYMENT METHOD
// ----------------------------------
describe('Test Update Payment', () => {
  it('Gagal memperbarui pembayaran karena pembayaran tidak ditemukan', async () => {
    const response = await request(app)
      .patch('/payments/invalid-id')
      .send({
        paymentMethod: 'bank_transfer',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Pembayaran tidak ditemukan');
  });

  it('Gagal memperbarui pembayaran karena bukan pengguna yang membuat pembayaran', async () => {
    const fakeToken = generateToken({
      user_id: '0987654321',
      role: 'user',
    });
    const response = await request(app)
      .patch(`/payments/${payment?.body.data.id}`)
      .send({
        paymentMethod: 'bank_transfer',
      })
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Anda tidak memiliki akses');
  });

  it('Gagal memperbarui pembayaran karena input tidak valid', async () => {
    const response = await request(app)
      .patch(`/payments/${payment?.body.data.id}`)
      .send({
        paymentMethod: '',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Input data gagal');
  });

  it('Berhasil memperbarui metode pembayaran', async () => {
    const response = await request(app)
      .patch(`/payments/${payment?.body.data.id}`)
      .send({
        paymentMethod: 'bank_transfer',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Berhasil memperbarui metode pembayaran');
  });
});

// ----------------------------------
// UJI COBA PAYMENT WEBHOOK
// ----------------------------------
describe('Test Payment Webhook', () => {
  it('Gagal memproses webhook karena pembayaran tidak ditemukan', async () => {
    const response = await request(app)
      .post('/payments/webhook')
      .send({
        id: 'invalid-id',
        status: 'PAID',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Pembayaran tidak ditemukan');
  });

  it('Gagal memproses webhook karena input tidak valid', async () => {
    const response = await request(app)
      .post('/payments/webhook')
      .send({
        id: payment?.body.data.id,
        status: '',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Input data gagal');
  });

  it('Berhasil memproses webhook', async () => {
    const response = await request(app)
      .post('/payments/webhook')
      .send({
        id: payment?.body.data.id,
        status: 'PAID',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Webhook berhasil diproses');
  });
});
