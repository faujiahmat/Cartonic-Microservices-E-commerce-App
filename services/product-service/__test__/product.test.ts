import request from 'supertest';
import app from '../src/app';
import { describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { generateToken } from '../src/utils/jwt';
import Product from '../src/models/product.model';
import Category from '../src/models/category.model';

beforeAll(async () => {
  await Category.create({
    name: 'Kategori Test',
  });
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

//? PRODUCT
// ----------------------------------
// UJI COBA CREATE PRODUCT
// ----------------------------------
describe('Product Create Tests', () => {
  let token: string;
  beforeEach(async () => {
    token = generateToken({
      user_id: '1234567890',
      role: 'admin',
    });
  });
  it('Gagal membuat produk karena role tidak sesuai', async () => {
    const fakeToken = generateToken({
      user_id: '1234567890',
      role: 'user',
    });

    const response = await request(app)
      .post('/products')
      .send({
        name: 'Produk Test',
        price: 10000,
        stock: 10,
      })
      .set('Authorization', `Bearer ${fakeToken}`);
    expect(response.status).toBe(403);
    expect(response.body.message).toEqual('Forbidden');
  });

  it('Gagal membuat produk baru dengan data tidak valid', async () => {
    const response = await request(app)
      .post('/products')
      .send({
        name: '',
        price: -100,
        stock: -10,
      })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Input data gagal');
  });

  it('Berhasil membuat produk baru dengan data valid', async () => {
    const category = await Category.findOne({ name: 'Kategori Test' });

    const response = await request(app)
      .post('/products')
      .send({
        name: 'Produk Test',
        price: 10000,
        stock: 10,
        category: [category?._id],
        images: ['https://example.com/image.jpg'],
        description: 'Deskripsi produk test',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body.message).toEqual('Produk berhasil ditambahkan');
  });
});

// ----------------------------------
// UJI COBA GET ALL PRODUCTS
// ----------------------------------
describe('Product Get All Tests', () => {
  it('Berhasil mendapatkan semua produk', async () => {
    const response = await request(app).get('/products');
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Berhasil mendapatkan semua produk');
  });
});

// ----------------------------------
// UJI COBA GET PRODUCT BY ID
// ----------------------------------
describe('Product Get By ID Tests', () => {
  it('Gagal mendapatkan produk karena produk tidak ditemukan', async () => {
    const response = await request(app).get('/products/invalid-id');
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual('Produk tidak ditemukan');
  });

  it('Berhasil mendapatkan produk berdasarkan ID', async () => {
    const product = await Product.findOne({ name: 'Produk Test' });
    const response = await request(app).get(`/products/${product?.product_id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Berhasil mendapatkan produk');
  });
});

// ----------------------------------
// UJI COBA UPDATE PRODUCT
// ----------------------------------
describe('Product Update Tests', () => {
  let token: string;

  beforeAll(async () => {
    token = generateToken({
      user_id: '1234567890',
      role: 'admin',
    });
  });

  it('Gagal memperbarui produk karena role bukan admin', async () => {
    const fakeToken = generateToken({
      user_id: '1234567890',
      role: 'user',
    });

    const response = await request(app)
      .patch('/products/invalid-id')
      .send({
        name: 'Produk Test Update',
        price: 20000,
        stock: 20,
      })
      .set('Authorization', `Bearer ${fakeToken}`);
    expect(response.status).toBe(403);
    expect(response.body.message).toEqual('Forbidden');
  });

  it('Gagal memperbarui produk karena input data tidak valid', async () => {
    const response = await request(app)
      .patch('/products/invalid-id')
      .send({
        name: '',
        price: -200,
        stock: -20,
      })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Input data gagal');
  });

  it('Gagal memperbarui produk karena produk tidak ditemukan', async () => {
    const response = await request(app)
      .patch('/products/invalid-id')
      .send({
        name: 'Produk Test Update',
        price: 20000,
        stock: 20,
        images: ['https://example.com/image.jpg'],
        description: 'Deskripsi produk test update',
        category: ['67b8f57cca37ad2f6e1de764'], // Ganti dengan ID kategori yang valid
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual('Produk tidak ditemukan');
  });

  it('Berhasil memperbarui produk', async () => {
    const product = await Product.findOne({ name: 'Produk Test' });
    const response = await request(app)
      .patch(`/products/${product?.product_id}`)
      .send({
        name: 'Produk Test Update',
        price: 20000,
        stock: 20,
        description: 'Deskripsi produk test update',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Produk berhasil diperbarui');
  });
});

// ----------------------------------
// UJI COBA DELETE PRODUCT
// ----------------------------------
describe('Product Delete Tests', () => {
  let token: string;

  beforeAll(async () => {
    token = generateToken({
      user_id: '1234567890',
      role: 'admin',
    });
  });

  it('Gagal menghapus produk karena role bukan admin', async () => {
    const fakeToken = generateToken({
      user_id: '1234567890',
      role: 'user',
    });

    const response = await request(app)
      .delete('/products/invalid-id')
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toEqual('Forbidden');
  });

  it('Gagal menghapus produk karena produk tidak ditemukan', async () => {
    const response = await request(app)
      .delete('/products/invalid-id')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual('Produk tidak ditemukan');
  });

  it('Berhasil menghapus produk', async () => {
    const product = await Product.findOne({ name: 'Produk Test Update' });
    const response = await request(app)
      .delete(`/products/${product?.product_id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Produk berhasil dihapus');
  });
});

// ----------------------------------
// UJI COBA ADD CATEGORY TO PRODUCT
// ----------------------------------
describe('Product Add Category Tests', () => {
  let token: string;

  beforeAll(async () => {
    await Product.deleteMany({ name: 'Produk Test' }); // Hapus produk dengan nama 'Produk Test' jika ada

    await Product.create({
      name: 'Produk Test',
      price: 10000,
      stock: 10,
      images: ['https://example.com/image.jpg'],
      description: 'Deskripsi produk test',
      category: ['67b8f57cca37ad2f6e1de764'], // Ganti dengan ID kategori yang valid
    });

    token = generateToken({
      user_id: '1234567890',
      role: 'admin',
    });
  });

  it('Gagal menambahkan kategori ke produk karena role bukan admin', async () => {
    const fakeToken = generateToken({
      user_id: '1234567890',
      role: 'user',
    });

    const response = await request(app)
      .post('/products/invalid-id/categories')
      .send({
        category: 'fake-id',
      })
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toEqual('Forbidden');
  });

  it('Gagal menambahkan kategori ke produk karena produk tidak ditemukan', async () => {
    const response = await request(app)
      .post('/products/invalid-id/categories')
      .send({
        category_id: 'fake-id',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual('Produk tidak ditemukan');
  });

  it('Gagal menambahkan kategori ke produk karena kategori tidak ditemukan', async () => {
    const product = await Product.findOne({ name: 'Produk Test Update' });
    const response = await request(app)
      .post(`/products/${product?.product_id}/categories`)
      .send({
        category: 'invalid-id', // ID kategori yang tidak valid
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual('Kategori tidak ditemukan');
  });

  it('Gagal menambahkan kategori ke produk karena kategori sudah ada', async () => {
    const product = await Product.findOne({ name: 'Produk Test' }).populate('category');

    const response = await request(app)
      .post(`/products/${product?.product_id}/categories`)
      .send({
        category_id: product?.category?.map((category: any) => category.category_id?.toString()),
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Kategori sudah ada di produk ini');
  });

  it('Berhasil menambahkan kategori ke produk', async () => {
    const category = await Category.findOne({ name: 'Kategori Test' });

    const product = await Product.findOne({ name: 'Produk Test Update' });

    const response = await request(app)
      .post(`/products/${product?.product_id}/categories`)
      .send({
        category_id: category?.category_id,
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Kategori berhasil ditambahkan ke produk');
  });
});

// ----------------------------------
// UJI COBA REMOVE CATEGORY FROM PRODUCT
// ----------------------------------
describe('Product Remove Category Tests', () => {
  let token: string;

  beforeAll(async () => {
    token = generateToken({
      user_id: '1234567890',
      role: 'admin',
    });
  });

  it('Gagal menghapus kategori dari produk karena role bukan admin', async () => {
    const fakeToken = generateToken({
      user_id: '1234567890',
      role: 'user',
    });

    const response = await request(app)
      .delete('/products/invalid-product-id/categories/invalid-category-id')
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toEqual('Forbidden');
  });

  it('Gagal menghapus kategori dari produk karena produk tidak ditemukan', async () => {
    const response = await request(app)
      .delete('/products/invalid-product-id/categories/invalid-category-id')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual('Produk tidak ditemukan');
  });

  it('Gagal menghapus kategori dari produk karena kategori tidak ditemukan', async () => {
    const product = await Product.findOne({ name: 'Produk Test' });

    const response = await request(app)
      .delete(`/products/${product?.product_id}/categories/invalid-category-id`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual('Kategori tidak ditemukan');
  });

  it('Gagal menghapus kategori dari produk karena kategori tidak ada', async () => {
    const product = await Product.findOne({ name: 'Produk Test' }).populate('category');

    const response = await request(app)
      .delete(`/products/${product?.product_id}/categories/938490be-3056-4909-b85f-be100816aa36`) // Ganti dengan ID kategori yang tidak ada di dalam produk tapi ada di database
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Kategori tidak ditemukan di produk ini');
  });

  it('Berhasil menghapus kategori dari produk', async () => {
    const product = await Product.findOne({ name: 'Produk Test' }).populate('category');

    const response = await request(app)
      .delete(
        `/products/${product?.product_id}/categories/${product?.category?.map((category: any) => category.category_id?.toString())}`,
      )
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Kategori berhasil dihapus dari produk');
  });
});

//? CATEGORY
// ----------------------------------
// UJI COBA CREATE CATEGORY
// ----------------------------------
describe('Category Create Tests', () => {
  let token: string;

  beforeAll(async () => {
    token = generateToken({
      user_id: '1234567890',
      role: 'admin',
    });
  });

  it('Gagal membuat kategori baru karena role bukan admin', async () => {
    const fakeToken = generateToken({
      user_id: '1234567890',
      role: 'user',
    });

    const response = await request(app)
      .post('/products/categories')
      .send({
        name: 'Kategori Test',
      })
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toEqual('Forbidden');
  });

  it('Gagal membuat kategori baru karena kategori sudah ada', async () => {
    const response = await request(app)
      .post('/products/categories')
      .send({
        name: 'Kategori Test',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Kategori sudah terdaftar');
  });

  it('Gagal membuat kategori baru karena input data tidak valid', async () => {
    const response = await request(app)
      .post('/products/categories')
      .send({
        name: '',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Input data gagal');
  });

  it('Berhasil membuat kategori baru', async () => {
    const response = await request(app)
      .post('/products/categories')
      .send({
        name: 'Testing Kategori',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body.message).toEqual('Kategori berhasil dibuat');
  });
});

// ----------------------------------
// UJI COBA GET ALL CATEGORY
// ----------------------------------
describe('Category Get All Tests', () => {
  it('Berhasil mendapatkan semua kategori', async () => {
    const response = await request(app).get('/products/categories/all');
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Berhasil mendapatkan semua kategori');
  });
});

// ----------------------------------
// UJI COBA GET CATEGORY BY ID
// ----------------------------------
describe('Category Get By ID Tests', () => {
  it('Gagal mendapatkan kategori karena kategori tidak ditemukan', async () => {
    const response = await request(app).get('/products/categories/invalid-id');

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual('Kategori tidak ditemukan');
  });

  it('Berhasil mendapatkan kategori berdasarkan ID', async () => {
    const category = await Category.findOne({ name: 'Testing Kategori' });
    const response = await request(app).get(`/products/categories/${category?.category_id}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Berhasil mendapatkan kategori');
  });
});

// ----------------------------------
// UJI COBA UPDATE CATEGORY
// ----------------------------------
describe('Category Update Tests', () => {
  let token: string;

  beforeAll(async () => {
    token = generateToken({
      user_id: '1234567890',
      role: 'admin',
    });
  });

  it('Gagal memperbarui kategori karena role bukan admin', async () => {
    const fakeToken = generateToken({
      user_id: '1234567890',
      role: 'user',
    });

    const response = await request(app)
      .patch('/products/categories/invalid-id')
      .send({
        name: 'Kategori Test Update',
      })
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toEqual('Forbidden');
  });

  it('Gagal memperbarui kategori karena input data tidak valid', async () => {
    const category = await Category.findOne({ name: 'Testing Kategori' });
    const response = await request(app)
      .patch(`/products/categories/${category?.category_id}`)
      .send({
        name: '',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Input data gagal');
  });

  it('Gagal memperbarui kategori karena kategori sudah ada', async () => {
    await Category.create({
      name: 'Testing Kategori untuk update',
    });

    const category = await Category.findOne({ name: 'Testing Kategori untuk update' });
    const response = await request(app)
      .patch(`/products/categories/${category?.category_id}`)
      .send({
        name: 'Testing Kategori',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Kategori sudah terdaftar');
  });

  it('Gagal memperbarui kategori karena kategori tidak ditemukan', async () => {
    const response = await request(app)
      .patch('/products/categories/invalid-id')
      .send({
        name: 'Kategori Test Update',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual('Kategori tidak ditemukan');
  });

  it('Berhasil memperbarui kategori', async () => {
    const category = await Category.findOne({ name: 'Testing Kategori' });
    const response = await request(app)
      .patch(`/products/categories/${category?.category_id}`)
      .send({
        name: 'Testing Kategori Update',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Kategori berhasil diperbarui');
  });
});

// ----------------------------------
// UJI COBA DELETE CATEGORY
// ----------------------------------
describe('Category Delete Tests', () => {
  let token: string;

  beforeAll(async () => {
    token = generateToken({
      user_id: '1234567890',
      role: 'admin',
    });
  });

  it('Gagal menghapus kategori karena role bukan admin', async () => {
    const fakeToken = generateToken({
      user_id: '1234567890',
      role: 'user',
    });

    const response = await request(app)
      .delete('/products/categories/invalid-id')
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toEqual('Forbidden');
  });

  it('Gagal menghapus kategori karena kategori tidak ditemukan', async () => {
    const response = await request(app)
      .delete('/products/categories/invalid-id')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual('Kategori tidak ditemukan');
  });

  it('Berhasil menghapus kategori', async () => {
    const categoryNames = [
      'Testing Kategori Update',
      'Testing Kategori untuk update',
      'Kategori Test',
    ];

    for (const name of categoryNames) {
      const category = await Category.findOne({ name });
      const response = await request(app)
        .delete(`/products/categories/${category?.category_id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Kategori berhasil dihapus');
    }
  });
});

//? STOCK
// ----------------------------------
// UJI COBA UPDATE STOCK
// ----------------------------------
describe('Stock Update Tests', () => {
  let token: string;

  beforeAll(async () => {
    await Product.deleteMany({ name: 'Product Test' }); // Hapus produk dengan nama 'Product Test' jika ada

    // Buat produk dengan stok 0
    await Product.create({
      name: 'Product Test',
      price: 10000,
      stock: 0,
      category: ['67b8f57cca37ad2f6e1de764'], // Ganti dengan ID kategori yang valid
      images: ['https://example.com/image.jpg'],
    });
    token = generateToken({
      user_id: '1234567890',
      role: 'admin',
    });
  });

  it('Gagal mengupdate stok baru karena role bukan admin', async () => {
    const fakeToken = generateToken({
      user_id: '1234567890',
      role: 'user',
    });

    const response = await request(app)
      .put('/products/invalid-product-id/stock')
      .send({
        stock: 10,
      })
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toEqual('Forbidden');
  });

  it('Gagal mengupdate stok baru karena input data tidak valid', async () => {
    const response = await request(app)
      .put('/products/valid-product-id/stock')
      .send({
        stock: -10,
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Input data gagal');
  });

  it('Gagal mengupdate stok baru karena produk tidak ditemukan', async () => {
    const response = await request(app)
      .put('/products/invalid-product-id/stock')
      .send({
        stock: 10,
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual('Produk tidak ditemukan');
  });

  it('Berhasil mengupdate stok baru', async () => {
    const product = await Product.findOne({ name: 'Product Test' });
    const response = await request(app)
      .put(`/products/${product?.product_id}/stock`)
      .send({
        stock: 10,
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Stock berhasil diperbarui');
  });
});

// ----------------------------------
// UJI COBA GET STOCK
// ----------------------------------
describe('Stock Get Tests', () => {
  it('Gagal mendapatkan stok produk karena produk tidak ditemukan', async () => {
    const response = await request(app).get('/products/invalid-id/stock');

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual('Produk tidak ditemukan');
  });

  it('Berhasil mendapatkan stok produk', async () => {
    const product = await Product.findOne({ name: 'Product Test' });
    const response = await request(app).get(`/products/${product?.product_id}/stock`);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Berhasil mendapatkan stok produk');
  });
});

//? REVIEW
// ----------------------------------
// UJI COBA ADD REVIEW
// ----------------------------------
describe('Review Add Tests', () => {
  let token: string;

  beforeAll(async () => {
    token = generateToken({
      user_id: '1234567890',
      role: 'user',
    });
  });

  it('Gagal menambahkan review karena produk tidak ditemukan', async () => {
    const response = await request(app)
      .post('/products/invalid-id/reviews')
      .send({
        rating: 5,
        comment: 'Produk bagus',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual('Produk tidak ditemukan');
  });

  it('Gagal menambahkan review karena input data tidak valid', async () => {
    const product = await Product.findOne({ name: 'Product Test' });
    const response = await request(app)
      .post(`/products/${product?.product_id}/reviews`)
      .send({
        rating: 6,
        comment: 'Produk bagus',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Input data gagal');
  });

  it('Berhasil menambahkan review', async () => {
    const product = await Product.findOne({ name: 'Product Test' });
    const response = await request(app)
      .post(`/products/${product?.product_id}/reviews`)
      .send({
        rating: 5,
        comment: 'Produk bagus',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body.message).toEqual('Review berhasil ditambahkan');
  });
});

// ----------------------------------
// UJI COBA GET REVIEWS
// ----------------------------------
describe('Review Get Tests', () => {
  it('Gagal mendapatkan ulasan produk karena produk tidak ditemukan', async () => {
    const response = await request(app).get('/products/invalid-id/reviews');

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual('Ulasan tidak ditemukan');
  });

  it('Berhasil mendapatkan ulasan produk', async () => {
    const product = await Product.findOne({ name: 'Product Test' });
    const response = await request(app).get(`/products/${product?.product_id}/reviews`);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Berhasil mendapatkan ulasan produk');
  });
});

// ----------------------------------
// UJI COBA UPDATE REVIEW
// ----------------------------------
describe('Review Update Tests', () => {
  let token: string;

  beforeAll(async () => {
    token = generateToken({
      user_id: '1234567890',
      role: 'user',
    });
  });

  it('Gagal memperbarui review karena review tidak ditemukan', async () => {
    const product = await Product.findOne({ name: 'Product Test' });

    const response = await request(app)
      .patch(`/products/${product?.product_id}/reviews/invalid-review-id`)
      .send({
        rating: 5,
        comment: 'Produk bagus',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual('Ulasan tidak ditemukan');
  });

  it('Gagal memperbarui review karena input data tidak valid', async () => {
    const product = await Product.findOne({ name: 'Product Test' });

    const response = await request(app)
      .patch(`/products/${product?.product_id}/reviews/1`)
      .send({
        rating: 6,
        comment: 'Produk bagus',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Input data gagal');
  });

  it('Berhasil memperbarui review', async () => {
    const product = await Product.findOne({ name: 'Product Test' });

    const review = await request(app).get(`/products/${product?.product_id}/reviews`);

    const reviewId = review.body.data[0].reviewId;

    const response = await request(app)
      .patch(`/products/${product?.product_id}/reviews/${reviewId}`)
      .send({
        rating: 3,
        comment: 'Setelah pemakaian ada kurangnya ternyata',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Berhasil memperbarui ulasan');
  });
});

// ----------------------------------
// UJI COBA DELETE REVIEW
// ----------------------------------
describe('Review Delete Tests', () => {
  let token: string;

  beforeAll(async () => {
    token = generateToken({
      user_id: '1234567890',
      role: 'user',
    });
  });

  it('Gagal menghapus review karena review tidak ditemukan', async () => {
    const product = await Product.findOne({ name: 'Product Test' });

    const response = await request(app)
      .delete(`/products/${product?.product_id}/reviews/invalid-review-id`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual('Ulasan tidak ditemukan');
  });

  it('Berhasil menghapus review', async () => {
    const product = await Product.findOne({ name: 'Product Test' });

    const review = await request(app).get(`/products/${product?.product_id}/reviews`);

    const reviewId = review.body.data[0].reviewId;

    const response = await request(app)
      .delete(`/products/${product?.product_id}/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Berhasil menghapus ulasan');
  });
});
