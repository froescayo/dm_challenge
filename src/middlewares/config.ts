import { NextFunction, Request, Response } from "express";
import Knex from "knex";
import {ProductRepository
} from "../repositories";

export function config(knex: Knex) {
  return function configMiddleware(req: Request, _res: Response, next: NextFunction) {
    req.knex = knex;
    req.db = {
      products: new ProductRepository(knex),
    };
    next();
  };
}
