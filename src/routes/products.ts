import { Router } from "express";
import { getProducts } from "../controllers";
import { Routes } from "../helpers/routes";
const routes = Router();

const { products } = Routes;

routes.get(products.get, getProducts);

export default routes;
