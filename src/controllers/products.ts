import { Request, Response } from "express";
import { errors } from "../helpers/errors";
import { StatusCodes } from "../helpers/statusCode";

export async function getProducts(req: Request, res: Response) {
  const { name } = req.params;
  const dbProduct = await req.db.products.findOneBy({ name });

  if (!dbProduct) {
    return res.status(StatusCodes.NOT_FOUND).send({ error: errors.products.notFound });
  }

  return res
    .status(StatusCodes.OKAY)
    .send({ name: dbProduct.name, price: dbProduct.price, quantity: dbProduct.quantity });
}
