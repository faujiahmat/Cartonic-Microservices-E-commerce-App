import request from 'supertest';
import app from '../src/app';
import { describe, it, expect, afterAll, beforeAll } from '@jest/globals';
import { generateToken } from '../src/utils/jwt';

let token: string;
let category: any;
let product: any;

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
// UJI COBA CREATE ORDER
// ----------------------------------
let order: any;
describe('Test Create Order', () => {
  it('Gagal membuat order karena input tidak valid', async () => {
    const response = await request(app)
      .post('/orders')
      .send({
        items: [
          {
            productId: 'invalid-product-id',
            quantity: -1,
          },
        ],
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Input data gagal');
  });

  it('Gagal membuat order karena produk tidak ditemukan', async () => {
    const response = await request(app)
      .post('/orders')
      .send({
        items: [
          {
            productId: '2323-2323-2323-2323',
            quantity: 2,
          },
        ],
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Produk tidak ditemukan');
  });

  it('Gagal membuat order karena stok tidak mencukupi', async () => {
    const response = await request(app)
      .post('/orders')
      .send({
        items: [
          {
            productId: product?.body.data.product_id,
            quantity: 11,
          },
        ],
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Stok tidak cukup');
  });

  it('Berhasil membuat order', async () => {
    order = await request(app)
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

    expect(order.status).toBe(201);
    expect(order.body.message).toBe('Berhasil membuat pesanan');
  });
});

// ----------------------------------
// UJI COBA GET ORDER
// ----------------------------------
describe('Test Get Order', () => {
  it('Gagal mendapatkan order karena order tidak ditemukan', async () => {
    const response = await request(app)
      .get('/orders/invalid-id')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Order tidak ditemukan');
  });

  it('Berhasil mendapatkan order', async () => {
    const response = await request(app)
      .get(`/orders/${order?.body.data.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Pesanan ditemukan');
  });
});

// ----------------------------------
// UJI COBA UPDATE ORDER STATUS
// ----------------------------------
describe('Test Update Order Status', () => {
  it('Gagal memperbarui status order karena bukan admin', async () => {
    const fakeToken = generateToken({
      user_id: '1234567890',
      role: 'user',
    });

    const response = await request(app)
      .patch(`/orders/${order?.body.data.id}/status`)
      .send({
        status: 'CONFIRMED',
      })
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Anda tidak memiliki akses');
  });

  it('Gagal memperbarui status order karena status tidak valid', async () => {
    const response = await request(app)
      .patch(`/orders/${order?.body.data.id}/status`)
      .send({
        status: 'INVALID_STATUS',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Input data gagal');
  });

  it('Gagal memperbarui status order karena order tidak ditemukan', async () => {
    const response = await request(app)
      .patch('/orders/invalid-id/status')
      .send({
        status: 'CONFIRMED',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Order tidak ditemukan');
  });

  it('Berhasil memperbarui status order', async () => {
    const response = await request(app)
      .patch(`/orders/${order?.body.data.id}/status`)
      .send({
        status: 'CONFIRMED',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Update status pesanan berhasil');
  });
});

// ----------------------------------
// UJI COBA DELETE ORDER
// ----------------------------------
describe('Test Delete Order', () => {
  it('Gagal menghapus order karena bukan admin', async () => {
    const fakeToken = generateToken({
      user_id: '1234567890',
      role: 'user',
    });

    const response = await request(app)
      .delete(`/orders/${order?.body.data.id}`)
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Anda tidak memiliki akses');
  });

  it('Gagal menghapus order karena order tidak ditemukan', async () => {
    const response = await request(app)
      .delete('/orders/invalid-id')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Order tidak ditemukan');
  });

  it('Berhasil menghapus order', async () => {
    const response = await request(app)
      .delete(`/orders/${order?.body.data.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Pesanan berhasil dihapus');
  });
});
