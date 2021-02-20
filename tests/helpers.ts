import { initialPopulate } from "../src/helpers/initialPopulate";
import { OrderItemRepository, OrderRepository, ProductRepository } from "../src/repositories";
import { knex } from "./setup";

export async function makeCtx() {
  await initialPopulate(knex);

  return {
    db: {
      products: new ProductRepository(knex),
      orders: new OrderRepository(knex),
      orderItems: new OrderItemRepository(knex),
    },
  };
}
