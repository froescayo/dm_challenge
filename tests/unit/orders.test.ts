import faker from "faker";
import supertest from "supertest";
import app from "../../src/app";
import { errors } from "../../src/helpers/errors";
import { Routes } from "../../src/helpers/routes";
import { StatusCodes } from "../../src/helpers/statusCode";
import { makeCtx } from "../helpers";
import { Context } from "../types/ctx";

describe("Orders", () => {
  let ctx: Context;
  const request = supertest(app);

  beforeAll(async () => {
    ctx = await makeCtx();
  });

  describe(Routes.orders.get, () => {
    it("should return status code 200 with empty result", async () => {
      const resp = await request.get(Routes.orders.get);

      expect(resp.status).toBe(StatusCodes.OKAY);
      expect(resp.body).toBeTruthy();
      expect(resp.body).toHaveProperty("orders");
      expect(resp.body.orders).toHaveLength(0);
    });

    it("should return status code 200 and some orders", async () => {
      const productName = "Broccoli";
      const product = await ctx.db.products.findOneBy({ name: productName });

      if (!product) {
        throw new Error("Product not found");
      }

      await ctx.db.products.update({ id: product.id, quantity: 3 });

      await request.post(Routes.orders.post).send([{ name: productName, quantity: 2 }]);

      const resp = await request.get(Routes.orders.get);

      expect(resp.status).toBe(StatusCodes.OKAY);
      expect(resp.body).toBeTruthy();
      expect(resp.body).toHaveProperty("orders");
      expect(resp.body.orders).toHaveLength(1);
    });
  });

  describe(Routes.orders.getParticularOrder, () => {
    it("should return status code 404 and not found error", async () => {
      const resp = await request.get(`/orders/${faker.random.uuid()}`);

      expect(resp.status).toBe(StatusCodes.NOT_FOUND);
      expect(resp.body.error).toBe(errors.orders.orderNotFound);
    });

    it("should return status code 200 and order that has been made", async () => {
      const productName = "Sea-buckthornberry";
      const quantityAsked = 2;
      const product = await ctx.db.products.findOneBy({ name: productName });

      if (!product) {
        throw new Error("Product not found");
      }

      await ctx.db.products.update({ id: product.id, quantity: 5 });
      const responseOrder = await request
        .post(Routes.orders.post)
        .send([{ name: productName, quantity: quantityAsked }]);

      const resp = await request.get(`/orders/${responseOrder.body.id}`);

      expect(resp.status).toBe(StatusCodes.OKAY);
      expect(resp.body).toBeTruthy();
      expect(resp.body).toHaveProperty("id");
      expect(resp.body).toHaveProperty("products");
      expect(resp.body).toHaveProperty("total");
      expect(resp.body.total).toBe(product.price * quantityAsked);
      expect(resp.body.products).toHaveLength(1);
    });
  });

  describe(Routes.orders.post, () => {
    it("should return status code 400 if invalid input is informed", async () => {
      const responseOne = await request
        .post(Routes.orders.post)
        .send({ name: faker.random.word(), quantity: faker.random.number() });
      const responseTwo = await request
        .post(Routes.orders.post)
        .send([{ name: faker.random.number(), quantity: faker.random.number() }]);
      const responseThree = await request
        .post(Routes.orders.post)
        .send([{ name: faker.random.word(), quantity: faker.random.word() }]);

      expect(responseOne.status).toBe(StatusCodes.VALIDATION_FAIL);
      expect(responseTwo.status).toBe(StatusCodes.VALIDATION_FAIL);
      expect(responseThree.status).toBe(StatusCodes.VALIDATION_FAIL);
    });

    it("should return status code 409 and its error", async () => {
      const resp = await request
        .post(Routes.orders.post)
        .send([{ name: faker.random.word(), quantity: faker.random.number() }]);

      expect(resp.status).toBe(StatusCodes.CONFLICT);
      expect(resp.body.error).toBe(errors.orders.unavailable);
    });

    it("should return status code 200 and the order data with one product", async () => {
      const productName = "Sunflower";
      const product = await ctx.db.products.findOneBy({ name: productName });

      if (!product) {
        throw new Error("Product not found");
      }

      await ctx.db.products.update({ id: product.id, quantity: 3 });

      const responsePost = await request.post(Routes.orders.post).send([{ name: productName, quantity: 2 }]);

      expect(responsePost.status).toBe(StatusCodes.OKAY);
      expect(responsePost.body).toHaveProperty("id");
      expect(responsePost.body).toHaveProperty("products");
      expect(responsePost.body.products).toHaveLength(1);
      expect(responsePost.body).toHaveProperty("total");
      expect(responsePost.body.total).toBe(2 * product.price);
    });

    it("should return status code 200 and the order data with more products", async () => {
      const productNameOne = "Sunflower";
      const productNameTwo = "Turnip";
      const productOne = await ctx.db.products.findOneBy({ name: productNameOne });
      const productTwo = await ctx.db.products.findOneBy({ name: productNameTwo });

      if (!productOne || !productTwo) {
        throw new Error("Product not found");
      }

      await ctx.db.products.update({ id: productOne.id, quantity: 3 });
      await ctx.db.products.update({ id: productTwo.id, quantity: 5 });

      const responsePost = await request.post(Routes.orders.post).send([
        { name: productNameOne, quantity: 2 },
        { name: productNameTwo, quantity: 1 },
      ]);

      expect(responsePost.status).toBe(StatusCodes.OKAY);
      expect(responsePost.body).toHaveProperty("id");
      expect(responsePost.body).toHaveProperty("products");
      expect(responsePost.body.products).toHaveLength(2);
      expect(responsePost.body).toHaveProperty("total");
      expect(responsePost.body.total).toBe(2 * productOne.price + 1 * productTwo.price);
    });
  });
});
