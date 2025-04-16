# 🧾 API Documentation - Cartonic Microservices

Dokumentasi endpoint dari seluruh layanan di dalam proyek **Cartonic**, sebuah dummy e-commerce berbasis arsitektur **microservices**.

---

## 📚 Table of Contents

### 🔐 Auth Service

- [POST /auth/register](#post-authregister)
- [POST /auth/login](#post-authlogin)
- [GET /auth/refresh-token](#get-authrefresh-token)
- [POST /auth/logout](#post-authlogout)

### 👤 User Service

- [GET /users/profile](#get-usersprofile)
- [PATCH /users/profile](#patch-usersprofile)
- [DELETE /users/profile](#delete-usersprofile)

### 📦 Product Service

- [POST /products](#post-products)
- [GET /products](#get-products)
- [GET /products/:product_id](#get-productsproduct_id)
- [PATCH /products/:product_id](#patch-productsproduct_id)
- [DELETE /products/:product_id](#delete-productsproduct_id)
- [POST /products/:product_id/categories](#post-productsproduct_idcategories)
- [DELETE /products/:product_id/categories/:category_id](#delete-productsproduct_idcategoriescategory_id)
- [PUT /products/:product_id/stock](#put-productsproduct_idstock)
- [GET /products/:product_id/stock](#get-productsproduct_idstock)
- [POST /products/:product_id/reviews](#post-productsproduct_idreviews)
- [GET /products/:product_id/reviews](#get-productsproduct_idreviews)
- [PATCH /products/:product_id/reviews/:review_id](#patch-productsproduct_idreviewsreview_id)
- [DELETE /products/:product_id/reviews/:review_id](#delete-productsproduct_idreviewsreview_id)
- [POST /products/categories](#post-productscategories)
- [GET /products/categories/all](#get-productscategoriesall)
- [GET /products/categories/:category_id](#get-productscategoriescategory_id)
- [PATCH /products/categories/:category_id](#patch-productscategoriescategory_id)
- [DELETE /products/categories/:category_id](#delete-productscategoriescategory_id)

### 🛒 Order Service

- [POST /orders](#post-orders)
- [GET /orders/:order_id](#get-ordersorder_id)
- [PATCH /orders/:order_id/status](#patch-ordersorder_idstatus)
- [DELETE /orders/:order_id](#delete-ordersorder_id)

### 💵 Payment Service

- [POST /payments](#post-payments)
- [GET /payments/:payment_id](#get-paymentspayment_id)
- [PATCH /payments/:payment_id](#patch-paymentspayment_id)
- [POST /payments/webhook](#post-paymentswebhook)

---

## 🔐 Auth Service

### POST /auth/register

Register pengguna baru.

**Request Body:**

```json
{
  "name": "Ahmat Fauji",
  "email": "ahmat@example.com",
  "password": "secret",
  "confirmPassword": "secret",
  "role": "user" # optional | user or admin (default: user)
}
```

**Response:**

```json
{
  "success": true,
  "message": "register berhasil",
  "data": {
    "name": "Ahmat Fauji",
    "email": "ahmat@example.com",
    "password": "$2a$10$MubP9W3rQqIcM05IGGrFZuTH4rVF49kqFMxQ/J0iQbz18Aqr3.pNi",
    "role": "user",
    "refreshToken": null,
    "_id": "67fdd65f21369dafed0e5ea5",
    "user_id": "5f6112d9-0000-455c-b468-930d451326fc",
    "createdAt": "2025-04-15T03:45:35.984Z",
    "updatedAt": "2025-04-15T03:45:35.984Z",
    "__v": 0
  },
  "error": null
}
```

---

### POST /auth/login

Login pengguna dan dapatkan token JWT.

**Request Body:**

```json
{
  "email": "ahmat@example.com",
  "password": "secret"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "_id": "67fdd65f21369dafed0e5ea5",
    "name": "Ahmat Fauji",
    "email": "ahmat@example.com",
    "password": "$2a$10$MubP9W3rQqIcM05IGGrFZuTH4rVF49kqFMxQ/J0iQbz18Aqr3.pNi",
    "role": "user",
    "user_id": "5f6112d9-0000-455c-b468-930d451326fc",
    "createdAt": "2025-04-15T03:45:35.984Z",
    "updatedAt": "2025-04-15T03:52:09.093Z",
    "__v": 0,
    "token": "jwt_token"
  },
  "error": null
}
```

---

### GET /auth/refresh-token

Merefresh token pengguna.

**Response:**

```json
{
  "success": true,
  "message": "Access token diperbarui",
  "data": {
    "token": "jwt_token"
  },
  "error": null
}
```

---

### POST /auth/logout

Logout pengguna.

**Header:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Logout berhasil",
  "data": {
    "_id": "67fdd65f21369dafed0e5ea5",
    "name": "Ahmat Fauji",
    "email": "ahmat@example.com",
    "password": "$2a$10$MubP9W3rQqIcM05IGGrFZuTH4rVF49kqFMxQ/J0iQbz18Aqr3.pNi",
    "role": "user",
    "refreshToken": null,
    "user_id": "5f6112d9-0000-455c-b468-930d451326fc",
    "createdAt": "2025-04-15T03:45:35.984Z",
    "updatedAt": "2025-04-15T03:59:06.338Z",
    "__v": 0
  },
  "error": null
}
```

---

## 👤 User Service

### GET /users/profile

Mengambil profil pengguna yang sedang login.

**Header:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Data pengguna berhasil didapatkan",
  "data": {
    "_id": "67fdd65f21369dafed0e5ea5",
    "name": "Ahmat Fauji",
    "email": "ahmat@example.com",
    "password": "$2a$10$MubP9W3rQqIcM05IGGrFZuTH4rVF49kqFMxQ/J0iQbz18Aqr3.pNi",
    "role": "user",
    "user_id": "5f6112d9-0000-455c-b468-930d451326fc",
    "createdAt": "2025-04-15T03:45:35.984Z",
    "updatedAt": "2025-04-15T04:00:15.324Z",
    "__v": 0
  },
  "error": null
}
```

---

### PATCH /users/profile

Memperbarui informasi pengguna.

**Header:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "Ahmat",
  "email": "ahmat@example.com",
  "password": "secret",
  "confirmPassword": "secret"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Data pengguna berhasil diupdate",
  "data": {
    "_id": "67fdd65f21369dafed0e5ea5",
    "name": "Ahmat",
    "email": "ahmat@example.com",
    "password": "$2a$10$kgq5kOUQjgw5xfEYfHz5seVsx20EjqUx4dfk7nqYB0po5UdMZSqC6",
    "role": "user",
    "user_id": "5f6112d9-0000-455c-b468-930d451326fc",
    "createdAt": "2025-04-15T03:45:35.984Z",
    "updatedAt": "2025-04-15T04:04:02.130Z",
    "__v": 0
  },
  "error": null
}
```

---

### DELETE /users/profile

Menghapus akun pengguna.

**Header:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "User berhasil dihapus",
  "data": {
    "_id": "67fdd65f21369dafed0e5ea5",
    "name": "Ahmat",
    "email": "ahmat@example.com",
    "password": "$2a$10$kgq5kOUQjgw5xfEYfHz5seVsx20EjqUx4dfk7nqYB0po5UdMZSqC6",
    "role": "user",
    "user_id": "5f6112d9-0000-455c-b468-930d451326fc",
    "createdAt": "2025-04-15T03:45:35.984Z",
    "updatedAt": "2025-04-15T04:04:02.130Z",
    "__v": 0
  },
  "error": null
}
```

---

## 📦 Product Service

### POST /products

#### (Admin Only)

Endpoint ini digunakan untuk membuat produk baru. Hanya admin yang memiliki akses ke endpoint ini.

**Request Body:**

```json
{
    "name": "Handphone",
    "description": "ini adalah deskripsi handphone", # optional
    "price": 2000000,
    "stock": 100,
    "images": ["http://www.example.image"],
    "category": ["67fddddf912b2f198442bde2"] # optional | array of category _id
}
```

**Response:**

```json
{
  "success": true,
  "message": "Produk berhasil ditambahkan",
  "data": {
    "name": "Handphone",
    "description": "ini adalah deskripsi handphone",
    "price": 2000000,
    "stock": 100,
    "category": [
      {
        "_id": "67fddddf912b2f198442bde2",
        "name": "Barang Elektronik",
        "description": "ini category Barang Elektronik",
        "category_id": "00ee8f69-4dd6-442f-9abe-2104753c96a9",
        "createdAt": "2025-04-15T04:17:35.400Z",
        "updatedAt": "2025-04-15T04:17:35.400Z",
        "__v": 0
      }
    ],
    "images": ["http://www.example.image"],
    "averageRating": 0,
    "_id": "67fdddf7912b2f198442bde4",
    "product_id": "b78072af-74dc-4d95-bf14-dd2d7b9d9742",
    "createdAt": "2025-04-15T04:17:59.948Z",
    "updatedAt": "2025-04-15T04:17:59.948Z",
    "__v": 0
  },
  "error": null
}
```

---

### GET /products

Mengambil daftar semua produk.

**Header:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Berhasil mendapatkan semua produk",
  "data": {
    "products": [
      {
        "_id": "67fdddf7912b2f198442bde4",
        "name": "Handphone",
        "description": "ini adalah deskripsi handphone",
        "price": 2000000,
        "stock": 100,
        "category": [
          {
            "_id": "67fddddf912b2f198442bde2",
            "name": "Barang Elektronik",
            "description": "ini category Barang Elektronik",
            "category_id": "00ee8f69-4dd6-442f-9abe-2104753c96a9",
            "createdAt": "2025-04-15T04:17:35.400Z",
            "updatedAt": "2025-04-15T04:17:35.400Z",
            "__v": 0
          }
        ],
        "images": ["http://www.example.image"],
        "averageRating": 0,
        "product_id": "b78072af-74dc-4d95-bf14-dd2d7b9d9742",
        "createdAt": "2025-04-15T04:17:59.948Z",
        "updatedAt": "2025-04-15T04:17:59.948Z",
        "__v": 0
      },
      {
        "_id": "67fddf12912b2f198442bded",
        "name": "Handphone Samsung",
        "description": "ini adalah deskripsi handphone Samsung",
        "price": 2000000,
        "stock": 100,
        "category": [
          {
            "_id": "67fddddf912b2f198442bde2",
            "name": "Barang Elektronik",
            "description": "ini category Barang Elektronik",
            "category_id": "00ee8f69-4dd6-442f-9abe-2104753c96a9",
            "createdAt": "2025-04-15T04:17:35.400Z",
            "updatedAt": "2025-04-15T04:17:35.400Z",
            "__v": 0
          }
        ],
        "images": ["http://www.example.image"],
        "averageRating": 0,
        "product_id": "20659e76-75de-44bc-8c2f-b44b9bd3f955",
        "createdAt": "2025-04-15T04:22:42.653Z",
        "updatedAt": "2025-04-15T04:22:42.653Z",
        "__v": 0
      }
    ],
    "pagination": {
      "total": 2,
      "page": 1,
      "limit": 2,
      "totalPages": 1
    }
  },
  "error": null
}
```

**Query Parameters:**

| Key       | Value (Default) | Description                                                  |
| --------- | --------------- | ------------------------------------------------------------ |
| page      | 1               | Halaman data yang ingin ditampilkan                          |
| limit     | 10              | Jumlah data yang ditampilkan per halaman                     |
| sort      | createdAt       | Field yang digunakan untuk mengurutkan data                  |
| sort      | price_asc       | Mengurutkan data secara ascending berdasarkan field "price"  |
| sort      | price_desc      | Mengurutkan data secara descending berdasarkan field "price" |
| search    | null            | Mencari data berdasarkan field "name"                        |
| category  | null            | Mencari data berdasarkan field "category"                    |
| minPrice  | null            | Mencari data berdasarkan field "price"                       |
| maxPrice  | null            | Mencari data berdasarkan field "price"                       |
| minRating | null            | Mencari data berdasarkan field "averageRating"               |

---

### GET /products/:product_id

Endpoint ini digunakan untuk mendapatkan detail produk berdasarkan ID produk.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Berhasil mendapatkan produk",
  "data": {
    "_id": "67fdddf7912b2f198442bde4",
    "name": "Handphone",
    "description": "ini adalah deskripsi handphone",
    "price": 2000000,
    "stock": 100,
    "category": [
      {
        "_id": "67fddddf912b2f198442bde2",
        "name": "Barang Elektronik",
        "description": "ini category Barang Elektronik",
        "category_id": "00ee8f69-4dd6-442f-9abe-2104753c96a9",
        "createdAt": "2025-04-15T04:17:35.400Z",
        "updatedAt": "2025-04-15T04:17:35.400Z",
        "__v": 0
      }
    ],
    "images": ["http://www.example.image"],
    "averageRating": 0,
    "product_id": "b78072af-74dc-4d95-bf14-dd2d7b9d9742",
    "createdAt": "2025-04-15T04:17:59.948Z",
    "updatedAt": "2025-04-15T04:17:59.948Z",
    "__v": 0
  },
  "error": null
}
```

---

### PATCH /products/:product_id

#### (Admin Only)

Endpoint ini digunakan untuk membuat mengupdate produk. Hanya admin yang memiliki akses ke endpoint ini. Boleh mengubah 1 atau lebih field.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "Sofa Merah 1",
  "description": "Ini deskripsi Handphone Oppo",
  "price": 1000000,
  "stock": 5,
  "images": ["http://www.example.image2"],
  "category": ["67fddddf912b2f198442bde2"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Produk berhasil diperbarui",
  "data": {
    "_id": "67fdddf7912b2f198442bde4",
    "name": "Sofa Merah 1",
    "description": "Ini deskripsi Handphone Oppo",
    "price": 1000000,
    "stock": 5,
    "category": [
      {
        "_id": "67fddddf912b2f198442bde2",
        "name": "Barang Elektronik",
        "description": "ini category Barang Elektronik",
        "category_id": "00ee8f69-4dd6-442f-9abe-2104753c96a9",
        "createdAt": "2025-04-15T04:17:35.400Z",
        "updatedAt": "2025-04-15T04:17:35.400Z",
        "__v": 0
      }
    ],
    "images": ["http://www.example.image2"],
    "averageRating": 0,
    "product_id": "b78072af-74dc-4d95-bf14-dd2d7b9d9742",
    "createdAt": "2025-04-15T04:17:59.948Z",
    "updatedAt": "2025-04-15T06:35:05.158Z",
    "__v": 0
  },
  "error": null
}
```

---

### DELETE /products/:product_id

#### (Admin Only)

Endpoint ini digunakan untuk menghapus produk. Hanya admin yang memiliki akses ke endpoint ini.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Produk berhasil dihapus",
  "data": {
    "_id": "67fb743c976f89e1ae82b0ba",
    "name": "produk baru 10",
    "price": 100000,
    "stock": 0,
    "category": [],
    "images": ["https://example.com/image.jpg"],
    "averageRating": 0,
    "product_id": "cdf306e9-e63c-4fb9-aa4f-3f54f70f3fea",
    "createdAt": "2025-04-13T08:22:20.797Z",
    "updatedAt": "2025-04-14T07:29:41.328Z",
    "__v": 0
  },
  "error": null
}
```

---

### POST /products/:product_id/categories

#### (Admin Only)

Endpoint ini digunakan untuk menambahkan kategori ke produk. Hanya admin yang memiliki akses ke endpoint ini.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "category_id": "0a1e263e-02b2-4659-a8a1-c2feb9596047"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Kategori berhasil ditambahkan ke produk",
  "data": {
    "_id": "67fdddf7912b2f198442bde4",
    "name": "Handphone Oppo",
    "description": "Ini deskripsi Handphone Oppo",
    "price": 1000000,
    "stock": 5,
    "category": [
      {
        "_id": "67fddddf912b2f198442bde2",
        "name": "Barang Elektronik",
        "description": "ini category Barang Elektronik",
        "category_id": "00ee8f69-4dd6-442f-9abe-2104753c96a9",
        "createdAt": "2025-04-15T04:17:35.400Z",
        "updatedAt": "2025-04-15T04:17:35.400Z",
        "__v": 0
      },
      {
        "_id": "67fcc47760858b41bd74c51f",
        "name": "Baju",
        "description": "ini category Baju",
        "category_id": "4e39d60e-d5e6-46f9-ad26-109d0f3867e2",
        "createdAt": "2025-04-14T08:16:55.715Z",
        "updatedAt": "2025-04-14T08:16:55.715Z",
        "__v": 0
      }
    ],
    "images": ["http://www.example.image2"],
    "averageRating": 0,
    "product_id": "b78072af-74dc-4d95-bf14-dd2d7b9d9742",
    "createdAt": "2025-04-15T04:17:59.948Z",
    "updatedAt": "2025-04-15T06:42:32.180Z",
    "__v": 1
  },
  "error": null
}
```

---

### DELETE /products/:product_id/categories/:category_id

#### (Admin Only)

Endpoint ini digunakan untuk menghapus kategori dari produk. Hanya admin yang memiliki akses ke endpoint ini.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Kategori berhasil dihapus dari produk",
  "data": {
    "_id": "67fdddf7912b2f198442bde4",
    "name": "Handphone Oppo",
    "description": "Ini deskripsi Handphone Oppo",
    "price": 1000000,
    "stock": 5,
    "category": [
      {
        "_id": "67fddddf912b2f198442bde2",
        "name": "Barang Elektronik",
        "description": "ini category Barang Elektronik",
        "category_id": "00ee8f69-4dd6-442f-9abe-2104753c96a9",
        "createdAt": "2025-04-15T04:17:35.400Z",
        "updatedAt": "2025-04-15T04:17:35.400Z",
        "__v": 0
      }
    ],
    "images": ["http://www.example.image2"],
    "averageRating": 0,
    "product_id": "b78072af-74dc-4d95-bf14-dd2d7b9d9742",
    "createdAt": "2025-04-15T04:17:59.948Z",
    "updatedAt": "2025-04-15T06:44:41.455Z",
    "__v": 2
  },
  "error": null
}
```

---

### PUT /products/:product_id/stock

#### (Admin Only)

Endpoint ini digunakan untuk mengubah stok produk. Hanya admin yang memiliki akses ke endpoint ini.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "stock": 100
}
```

**Response:**

```json
{
  "success": true,
  "message": "Stock berhasil diperbarui",
  "data": {
    "product_id": "b78072af-74dc-4d95-bf14-dd2d7b9d9742",
    "stock": 100
  },
  "error": null
}
```

---

### GET /products/:product_id/stock

Get stok produk.

**Response:**

```json
{
  "success": true,
  "message": "Berhasil mendapatkan stok produk",
  "data": {
    "product_id": "b78072af-74dc-4d95-bf14-dd2d7b9d9742",
    "stock": 100
  },
  "error": null
}
```

---

### POST /products/:product_id/reviews

Endpoint ini digunakan untuk menambahkan ulasan produk.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "rating": 5,
  "comment": "Perfect"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Review berhasil ditambahkan",
  "data": {
    "productId": "b78072af-74dc-4d95-bf14-dd2d7b9d9742",
    "userId": "ad6ae8f5-baf1-4890-a070-75f389df0f4a",
    "rating": 5,
    "comment": "Perfect",
    "_id": "67fe01fc912b2f198442be1d",
    "reviewId": "e04ec164-520c-4c36-9a77-1a669f8cbece",
    "createdAt": "2025-04-15T06:51:40.280Z",
    "updatedAt": "2025-04-15T06:51:40.280Z",
    "__v": 0
  },
  "error": null
}
```

---

### GET /products/:product_id/reviews

Endpoint ini digunakan untuk mendapatkan semua ulasan produk.

**Response:**

```json
{
  "success": true,
  "message": "Berhasil mendapatkan ulasan produk",
  "data": [
    {
      "_id": "67fe01fc912b2f198442be1d",
      "productId": "b78072af-74dc-4d95-bf14-dd2d7b9d9742",
      "userId": "ad6ae8f5-baf1-4890-a070-75f389df0f4a",
      "rating": 5,
      "comment": "Perfect",
      "reviewId": "e04ec164-520c-4c36-9a77-1a669f8cbece",
      "createdAt": "2025-04-15T06:51:40.280Z",
      "updatedAt": "2025-04-15T06:51:40.280Z",
      "__v": 0
    }
  ],
  "error": null
}
```

---

### PATCH /products/:product_id/reviews/:review_id

Endpoint ini digunakan untuk memperbarui ulasan produk.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "rating": 5,
  "comment": "setelah digunakan ternyata sangat bagus"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Berhasil memperbarui ulasan",
  "data": {
    "_id": "67fe01fc912b2f198442be1d",
    "productId": "b78072af-74dc-4d95-bf14-dd2d7b9d9742",
    "userId": "ad6ae8f5-baf1-4890-a070-75f389df0f4a",
    "rating": 5,
    "comment": "setelah digunakan ternyata sangat bagus",
    "reviewId": "e04ec164-520c-4c36-9a77-1a669f8cbece",
    "createdAt": "2025-04-15T06:51:40.280Z",
    "updatedAt": "2025-04-15T06:54:09.063Z",
    "__v": 0
  },
  "error": null
}
```

---

### DELETE /products/:product_id/reviews/:review_id

Endpoint ini digunakan untuk menghapus ulasan produk.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Berhasil menghapus ulasan",
  "data": {
    "_id": "67fe01fc912b2f198442be1d",
    "productId": "b78072af-74dc-4d95-bf14-dd2d7b9d9742",
    "userId": "ad6ae8f5-baf1-4890-a070-75f389df0f4a",
    "rating": 5,
    "comment": "setelah digunakan ternyata sangat bagus",
    "reviewId": "e04ec164-520c-4c36-9a77-1a669f8cbece",
    "createdAt": "2025-04-15T06:51:40.280Z",
    "updatedAt": "2025-04-15T06:54:09.063Z",
    "__v": 0
  },
  "error": null
}
```

---

### POST /products/categories

#### (Admin Only)

Endpoint ini digunakan untuk membuat kategory. Hanya admin yang memiliki akses ke endpoint ini.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
    "name": "Alat Rumah Tangga",
    "description": "ini category Alat Rumah Tangga" # optional
}
```

**Response:**

```json
{
  "success": true,
  "message": "Kategori berhasil dibuat",
  "data": {
    "name": "Alat Rumah Tangga",
    "description": "ini category Alat Rumah Tangga",
    "_id": "67fe0423912b2f198442be2c",
    "category_id": "fdb34eff-9bb1-4da9-92ae-a87461ad595e",
    "createdAt": "2025-04-15T07:00:51.301Z",
    "updatedAt": "2025-04-15T07:00:51.301Z",
    "__v": 0
  },
  "error": null
}
```

---

### GET /products/categories/all

Endpoint ini digunakan untuk mendapatkan seluruh kategori.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Berhasil mendapatkan semua kategori",
  "data": [
    {
      "_id": "67fddddf912b2f198442bde2",
      "name": "Barang Elektronik",
      "description": "ini category Barang Elektronik",
      "category_id": "00ee8f69-4dd6-442f-9abe-2104753c96a9",
      "createdAt": "2025-04-15T04:17:35.400Z",
      "updatedAt": "2025-04-15T04:17:35.400Z",
      "__v": 0
    },
    {
      "_id": "67fe0374912b2f198442be28",
      "name": "Alat Rumah Tangga",
      "description": "ini category Alat Rumah Tangga",
      "category_id": "d6100482-347a-4e26-a6d7-e7de81a4c640",
      "createdAt": "2025-04-15T06:57:56.108Z",
      "updatedAt": "2025-04-15T06:57:56.108Z",
      "__v": 0
    }
  ]
}
```

---

### GET /products/categories/:category_id

Endpoint ini digunakan untuk mendapatkan kategori tertentu.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Berhasil mendapatkan kategori",
  "data": {
    "_id": "67fddddf912b2f198442bde2",
    "name": "Barang Elektronik",
    "description": "ini category Barang Elektronik",
    "category_id": "00ee8f69-4dd6-442f-9abe-2104753c96a9",
    "createdAt": "2025-04-15T04:17:35.400Z",
    "updatedAt": "2025-04-15T04:17:35.400Z",
    "__v": 0
  },
  "error": null
}
```

---

### PATCH /products/categories/:category_id

#### (Admin Only)

Endpoint ini digunakan untuk mengupdate kategori. Hanya admin yang memiliki akses ke endpoint ini.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "Barang Elektronik Updated",
  "description": "ini category Barang Elektronik Updated"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Kategori berhasil diperbarui",
  "data": {
    "_id": "67fddddf912b2f198442bde2",
    "name": "Barang Elektronik Updated",
    "description": "ini category Barang Elektronik Updated",
    "category_id": "00ee8f69-4dd6-442f-9abe-2104753c96a9",
    "createdAt": "2025-04-15T04:17:35.400Z",
    "updatedAt": "2025-04-15T07:10:54.577Z",
    "__v": 0
  },
  "error": null
}
```

---

### DELETE /products/categories/:category_id

#### (Admin Only)

Endpoint ini digunakan untuk menghapus kategori. Hanya admin yang memiliki akses ke endpoint ini.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Kategori berhasil dihapus",
  "data": {
    "_id": "67fddddf912b2f198442bde2",
    "name": "Barang Elektronik Updated",
    "description": "ini category Barang Elektronik Updated",
    "category_id": "00ee8f69-4dd6-442f-9abe-2104753c96a9",
    "createdAt": "2025-04-15T04:17:35.400Z",
    "updatedAt": "2025-04-15T07:10:54.577Z",
    "__v": 0
  },
  "error": null
}
```

---

## 🛒 Order Service

### POST /orders

Endpoint ini digunakan untuk membuat order.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "items": [
    {
      "productId": "bbcf4aad-230d-4a34-8a4c-187536be1833",
      "quantity": 1
    },
    {
      "productId": "551c9065-846d-4ce9-9d0d-dfd2fa05faf5",
      "quantity": 1
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Berhasil membuat pesanan",
  "data": {
    "id": "90d52e48-5aab-4fe5-9ae5-2d769d502147",
    "userId": "ad6ae8f5-baf1-4890-a070-75f389df0f4a",
    "status": "PENDING",
    "createdAt": "2025-04-15T07:18:19.683Z",
    "updatedAt": "2025-04-15T07:18:19.683Z",
    "orderItems": [
      {
        "id": "12c358ea-6b23-4ac1-a1ca-cd2787bff9c8",
        "orderId": "90d52e48-5aab-4fe5-9ae5-2d769d502147",
        "productId": "bbcf4aad-230d-4a34-8a4c-187536be1833",
        "quantity": 1
      },
      {
        "id": "b3a50145-e734-44a3-9c13-3d4179a87caf",
        "orderId": "90d52e48-5aab-4fe5-9ae5-2d769d502147",
        "productId": "551c9065-846d-4ce9-9d0d-dfd2fa05faf5",
        "quantity": 1
      }
    ]
  },
  "error": null
}
```

---

### GET /orders/:order_id

> order_id adalah id di response saat membuat order

Endpoint ini digunakan untuk mendapatkan order.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Pesanan ditemukan",
  "data": {
    "id": "90d52e48-5aab-4fe5-9ae5-2d769d502147",
    "userId": "ad6ae8f5-baf1-4890-a070-75f389df0f4a",
    "status": "PENDING",
    "createdAt": "2025-04-15T07:18:19.683Z",
    "updatedAt": "2025-04-15T07:18:19.683Z",
    "orderItems": [
      {
        "id": "12c358ea-6b23-4ac1-a1ca-cd2787bff9c8",
        "orderId": "90d52e48-5aab-4fe5-9ae5-2d769d502147",
        "productId": "bbcf4aad-230d-4a34-8a4c-187536be1833",
        "quantity": 1
      },
      {
        "id": "b3a50145-e734-44a3-9c13-3d4179a87caf",
        "orderId": "90d52e48-5aab-4fe5-9ae5-2d769d502147",
        "productId": "551c9065-846d-4ce9-9d0d-dfd2fa05faf5",
        "quantity": 1
      }
    ]
  },
  "error": null
}
```

---

### PATCH /orders/:order_id/status

> order_id adalah id di response saat membuat order

#### (Admin Only)

Endpoint ini digunakan untuk mengubah status order. Hanya admin yang bisa mengakses endpoint ini.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "status": "CANCELED"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Update status pesanan berhasil",
  "data": {
    "id": "90d52e48-5aab-4fe5-9ae5-2d769d502147",
    "userId": "ad6ae8f5-baf1-4890-a070-75f389df0f4a",
    "status": "CANCELED",
    "createdAt": "2025-04-15T07:18:19.683Z",
    "updatedAt": "2025-04-15T07:24:38.493Z"
  },
  "error": null
}
```

---

### DELETE /orders/:order_id/

> order_id adalah id di response saat membuat order

#### (Admin Only)

Endpoint ini digunakan untuk menghapus order. Hanya admin yang bisa mengakses endpoint ini.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Pesanan berhasil dihapus",
  "data": {
    "id": "90d52e48-5aab-4fe5-9ae5-2d769d502147",
    "userId": "ad6ae8f5-baf1-4890-a070-75f389df0f4a",
    "status": "CANCELED",
    "createdAt": "2025-04-15T07:18:19.683Z",
    "updatedAt": "2025-04-15T07:28:20.436Z"
  },
  "error": null
}
```

---

## 💵 Payment Service

### POST /payments

#### (Admin Only)

Endpoint ini digunakan untuk membuat payment. Hanya admin yang bisa mengakses endpoint ini.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
    "orderId": "d3f7f0b8-0442-4b36-985c-6bfcf3dde2f9",
    "amount": 1,
    "status": "PAID", # optional | PENDING (default)
    "paymentMethod": "Bank"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Pembayaran berhasil",
  "data": {
    "id": "d8a8d4aa-eaf6-493f-9da5-fcd3e7805e31",
    "userId": "ad6ae8f5-baf1-4890-a070-75f389df0f4a",
    "orderId": "d3f7f0b8-0442-4b36-985c-6bfcf3dde2f9",
    "amount": "1",
    "status": "PAID",
    "paymentMethod": "Bank",
    "createdAt": "2025-04-15T07:40:18.316Z",
    "updatedAt": "2025-04-15T07:40:18.316Z"
  },
  "error": null
}
```

---

### GET /payments/:payment_id

> payment_id adalah id di response membuat payment

#### (Admin Only)

Endpoint ini digunakan untuk mendapatkan detail payment. Hanya admin yang bisa mengakses endpoint ini.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Pembayaran ditemukan",
  "data": {
    "id": "539e7419-7ea2-465f-80d2-0f0588393836",
    "userId": "ad6ae8f5-baf1-4890-a070-75f389df0f4a",
    "orderId": "d3c9cdf0-c039-444d-b5c0-311b4acc6e9c",
    "amount": "1",
    "status": "PAID",
    "paymentMethod": "Bank BNI",
    "createdAt": "2025-04-14T13:20:40.235Z",
    "updatedAt": "2025-04-14T13:23:06.186Z"
  },
  "error": null
}
```

---

### PATCH /payments/:payment_id

> payment_id adalah id di response membuat payment

#### (Admin Only)

Endpoint ini digunakan untuk mengubah metode payment. Hanya admin yang bisa mengakses endpoint ini.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "paymentMethod": "Bank BNI"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Berhasil memperbarui metode pembayaran",
  "data": {
    "id": "539e7419-7ea2-465f-80d2-0f0588393836",
    "userId": "ad6ae8f5-baf1-4890-a070-75f389df0f4a",
    "orderId": "d3c9cdf0-c039-444d-b5c0-311b4acc6e9c",
    "amount": "1",
    "status": "PAID",
    "paymentMethod": "Bank BNI",
    "createdAt": "2025-04-14T13:20:40.235Z",
    "updatedAt": "2025-04-15T07:45:04.671Z"
  },
  "error": null
}
```

---

### POST /payments/webhook

Endpoint ini digunakan untuk webhook payment gateway.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "id": "539e7419-7ea2-465f-80d2-0f0588393836",
  "status": "PAID"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Webhook berhasil diproses",
  "data": {
    "id": "539e7419-7ea2-465f-80d2-0f0588393836",
    "userId": "ad6ae8f5-baf1-4890-a070-75f389df0f4a",
    "orderId": "d3c9cdf0-c039-444d-b5c0-311b4acc6e9c",
    "amount": "1",
    "status": "PAID",
    "paymentMethod": "Bank BNI",
    "createdAt": "2025-04-14T13:20:40.235Z",
    "updatedAt": "2025-04-15T07:47:56.415Z"
  },
  "error": null
}
```

---

> 📌 Dokumentasi ini akan terus diperbarui seiring penambahan layanan dan endpoint baru.

```

```
