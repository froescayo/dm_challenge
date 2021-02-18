import Knex from "knex";
import { DBProduct } from "../db";
import { Repository } from "./Repository";

export class ProductRepository extends Repository<DBProduct> {
  constructor(knex: Knex) {
    super(knex, "products");
  }
}
