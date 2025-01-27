import * as Knex from "knex";
import { createTable, dropTable } from "../helpers/knex";

export async function up(knex: Knex) {
    await createTable(knex, "order_items", table => {
      table.text("name").notNullable();
      table.float("price").notNullable().defaultTo("0.00");
      table.integer("quantity").notNullable().defaultTo(0);
      table.uuid("orderId").notNullable();
    });
}

export async function down(knex: Knex) {
    await dropTable(knex, "orders");
}
