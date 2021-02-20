import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { errors } from "../helpers/errors";
import { StatusCodes } from "../helpers/statusCode";
import { InputMakeOrder } from "../types/orders";
import { validatorInputMakeOrder } from "../validators/orders";

export async function makeOrder(req: Request, res: Response) {
  const input: InputMakeOrder[] = req.body;

  const { error } = validatorInputMakeOrder.validate(input);

  if (error !== undefined) {
    return res.status(StatusCodes.VALIDATION_FAIL).send({ error });
  }

  try {
    const order = await req.knex.transaction(async trx => {
      const productsOrdered = [];
      let total = 0.0;

      for (const { name, quantity } of input) {
        const dbProduct = await req.db.products.findOneBy(
          { name: name },
          qb => {
            return qb.where("quantity", ">=", quantity);
          },
          trx,
        );

        if (!dbProduct) {
          throw new Error(errors.orders.outOfDisponibility);
        }

        await req.db.products.update(
          {
            id: dbProduct.id,
            quantity: dbProduct.quantity - quantity,
          },
          trx,
        );

        total += quantity * dbProduct.price;

        productsOrdered.push({ name: dbProduct.name, price: dbProduct.price, quantity });
      }

      const order = await req.db.orders.insert(
        {
          total,
        },
        trx,
      );

      await req.knex("order_items").insert(
        productsOrdered.map(cur => {
          return { ...cur, id: uuid(), orderId: order.id };
        }),
      );

      return { id: order.id, products: productsOrdered, total };
    });

    return res.status(StatusCodes.OKAY).send(order);
  } catch (error) {
    return res.status(StatusCodes.UNPROCESSABLE_ENTITY).send({ error: errors.orders.outOfDisponibility });
  }
}
