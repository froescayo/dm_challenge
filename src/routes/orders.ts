import { Router } from "express";
import { getOrder, getOrders, makeOrder } from "../controllers";
import { Routes } from "../helpers/routes";
const routes = Router();

const { orders } = Routes;

routes.get(orders.get, getOrders);
routes.get(orders.getParticularOrder, getOrder);
routes.post(orders.post, makeOrder);

export default routes;
