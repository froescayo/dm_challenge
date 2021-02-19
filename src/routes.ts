import { Router } from "express";
import productRoutes from "./routes/products";

const routes = Router();

routes.use(productRoutes);

export default routes;
