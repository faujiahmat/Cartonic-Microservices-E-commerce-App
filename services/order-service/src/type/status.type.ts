export default interface Istatus {
  status: OrderStatus;
}

enum OrderStatus {
  PENDING,
  CONFIRMED,
  SHIPPED,
  DELIVERED,
  CANCELED,
}
