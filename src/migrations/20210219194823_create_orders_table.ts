import * as Knex from "knex";
import { createTable, dropTable } from "../helpers/knex";

export async function up(knex: Knex) {
    await createTable(knex, "orders", table => {
        table.float("total").notNullable().defaultTo("0.00");
    });
}

export async function down(knex: Knex) {
    await dropTable(knex, "orders");
}
