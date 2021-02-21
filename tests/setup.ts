import faker from "faker";
import Knex from "knex";
import pg from "pg";
import { env } from "../src/helpers/env";
import { getKnexInstance, instances as knexInstances } from "../src/helpers/knex";
import { initialPopulate } from "../src/helpers/populate";
import { databaseName } from "../src/knex";

jest.setTimeout(20000);

process.env.TZ = "UTC";

const fakerSeed = process.env.FAKER_SEED ? parseInt(process.env.FAKER_SEED, 10) : Math.floor(100000 * Math.random());

export let masterConn: pg.Pool;
export let knex: Knex;

beforeAll(async () => {
  faker.seed(fakerSeed);
  if (!process.env.FAKER_SEED) {
    console.log(`Faker seed: ${fakerSeed}`);
  }

  try {
    masterConn = new pg.Pool({
      host: env.DB_HOST,
      password: env.DB_PASSWORD,
      port: parseInt(env.DB_PORT || "5432", 10),
      user: env.DB_USERNAME,
    });

    await masterConn.query(`CREATE DATABASE ${databaseName};`);

    knex = getKnexInstance(databaseName);

    await knex.raw(`CREATE EXTENSION IF NOT EXISTS "unaccent";`);

    await initialPopulate(knex);
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    process.stderr.write(`${err}\n${err.stack || ""}\n`);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
});

afterAll(async () => {
  await masterConn.end();
  await Promise.all(knexInstances.map(async i => i.destroy()));
});
