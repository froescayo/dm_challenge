import { NextFunction, Request, Response } from "express";
import Knex from "knex";
import { OrderItemRepository, OrderRepository, ProductRepository } from "../repositories";

export function config(knex: Knex) {
  return function configMiddleware(req: Request, _res: Response, next: NextFunction) {
    req.knex = knex;
    req.db = {
      products: new ProductRepository(knex),
      orders: new OrderRepository(knex),
      orderItems: new OrderItemRepository(knex),
    };
    next();
  };
}
