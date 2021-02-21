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
          throw new Error(errors.orders.unavailable);
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

      const products = productsOrdered.map(cur => {
        return { ...cur, id: uuid(), orderId: order.id };
      });

      await trx("order_items").insert(products);

      return { id: order.id, products: productsOrdered, total };
    });

    return res.status(StatusCodes.OKAY).send(order);
  } catch (error) {
    return res.status(StatusCodes.CONFLICT).send({ error: errors.orders.unavailable });
  }
}

export async function getOrders(req: Request, res: Response) {
  try {
    const dbOrders = await req.db.orders.findAll();

    const completeOrders = [];

    for (const dbOrder of dbOrders) {
      const dbOrderItems = await req.db.orderItems.findBy({ orderId: dbOrder.id });

      completeOrders.push({
        id: dbOrder.id,
        products: dbOrderItems.map(cur => {
          return { name: cur.name, price: cur.price, quantity: cur.quantity };
        }),
        total: dbOrder.total,
      });
    }

    return res.status(StatusCodes.OKAY).send({ orders: completeOrders });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}

export async function getOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const dbOrder = await req.db.orders.findOneBy({ id });

    if (!dbOrder) {
      return res.status(StatusCodes.NOT_FOUND).send({ error: errors.orders.orderNotFound });
    }

    const dbOrderItems = await req.db.orderItems.findBy({ orderId: dbOrder.id });

    return res.status(StatusCodes.OKAY).send({
      id: dbOrder.id,
      products: dbOrderItems.map(cur => {
        return { name: cur.name, price: cur.price, quantity: cur.quantity };
      }),
      total: dbOrder.total,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}
