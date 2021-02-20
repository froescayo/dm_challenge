import { Router } from "express";
import ordersRoutes from "./routes/orders";
import productRoutes from "./routes/products";

const routes = Router();

routes.use(productRoutes);
routes.use(ordersRoutes);

export default routes;
