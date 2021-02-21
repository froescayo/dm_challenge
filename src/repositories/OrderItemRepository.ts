import Knex from "knex";
import { DBOrderItem } from "../db";
import { Repository } from "./repository";

export class OrderItemRepository extends Repository<DBOrderItem> {
  constructor(knex: Knex) {
    super(knex, "order_items");
  }
}
