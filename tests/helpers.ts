import { OrderItemRepository, OrderRepository, ProductRepository } from "../src/repositories";
import { knex } from "./setup";

export async function makeCtx() {
  return {
    db: {
      products: new ProductRepository(knex),
      orders: new OrderRepository(knex),
      orderItems: new OrderItemRepository(knex),
    },
  };
}
