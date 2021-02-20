import { OrderItemRepository, OrderRepository, ProductRepository } from "../repositories";
export interface Repositories {
  products: ProductRepository;
  orders: OrderRepository;
  orderItems: OrderItemRepository;
}
