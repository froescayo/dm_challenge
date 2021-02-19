import Knex from "knex";

export async function createTable(
    knex: Knex,
    tableName: string,
    tableBuilder: (table: Knex.CreateTableBuilder) => void,
    idColumnType: "text" | "uuid" = "uuid",
    ) {
    await knex.schema.createTable(tableName, table => {
        table[idColumnType]("id").primary();
        table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now());
        table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now());
        table.timestamp("deletedAt").defaultTo(null);
        tableBuilder(table);
    });
}

export async function dropTable(knex: Knex, tableName: string) {
    await knex.schema.dropTable(tableName);
}
