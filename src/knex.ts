import Knex from "knex";
import { databasename } from "../tests/setup";
import { env } from "./helpers/env";

const options: Knex.Config = {
  client: "pg",
  connection: {
    database: process.env.NODE_ENV && process.env.NODE_ENV === "test" ? databasename : env.DB_DATABASE,
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
