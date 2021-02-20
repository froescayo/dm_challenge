import faker from "faker";
import { DBOrder, DBOrderItem } from "../../src/db";

export function orderFactory(
  info: Partial<Omit<DBOrder, "id" | "createdAt" | "deletedAt" | "updatedAt">>,
): Omit<DBOrder, "id" | "createdAt" | "deletedAt" | "updatedAt"> {
  return {
    total: faker.random.float(),
    ...info,
  };
}

export function orderItemFactory(
  info: Partial<Omit<DBOrderItem, "id" | "createdAt" | "deletedAt" | "updatedAt">>,
): Omit<DBOrderItem, "id" | "createdAt" | "deletedAt" | "updatedAt"> {
  return {
    name: faker.random.word(),
    price: faker.random.float(),
    orderId: faker.random.uuid(),
    quantity: faker.random.number(),
    ...info,
  };
}
