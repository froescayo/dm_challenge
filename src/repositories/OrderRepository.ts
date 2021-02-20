import Knex from "knex";
import { DBOrder } from "../db";
import { Repository } from "./Repository";

export class OrderRepository extends Repository<DBOrder> {
  constructor(knex: Knex) {
    super(knex, "orders");
  }
}
