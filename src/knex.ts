import { randomBytes } from "crypto";
import Knex from "knex";
import { env } from "./helpers/env";

export const databaseName =
  process.env.NODE_ENV && process.env.NODE_ENV === "test" ? `test_${randomBytes(8).toString("hex")}` : env.DB_DATABASE;

const options: Knex.Config = {
  client: "pg",
  connection: {
    database: databaseName,
    host: env.DB_HOST,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    port: parseInt(env.DB_PORT || "5432", 10),
  },
  migrations: {
    directory: "src/migrations",
    extension: "ts",
  },
};
const knex: Knex = Knex(options);

export default knex;
