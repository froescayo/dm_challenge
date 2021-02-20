import { Router } from "express";
import { getProducts, makeOrder } from "../controllers";
import { Routes } from "../helpers/routes";
const routes = Router();

const { orders } = Routes;

routes.get(orders.get, getProducts);
routes.post(orders.post, makeOrder);

export default routes;
