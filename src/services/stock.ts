import * as Amqp from "amqp-ts";
import { storageManagement } from "../helpers/products";
import knex from "../knex";
import { ProductRepository } from "../repositories";

const productsRepository = new ProductRepository(knex);

export async function activateStockManagement() {
  const connection = new Amqp.Connection(`amqp://localhost:${process.env.RABBITMQ_PORT}`);
  const exchange = connection.declareExchange("stock");
  const queue = connection.declareQueue("storage");

  queue.bind(exchange);
  queue.activateConsumer(
    async message => {
      const content = message.content.toString();
      const routingKey = message.fields.routingKey;
      await storageManagement(productsRepository, routingKey, content);
    },
    { noAck: true },
  );
}
