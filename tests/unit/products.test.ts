import faker from "faker";
import supertest from "supertest";
import app from "../../src/app";
import { errors } from "../../src/helpers/errors";
import { Routes } from "../../src/helpers/routes";
import { StatusCodes } from "../../src/helpers/statusCode";
import { makeCtx } from "../helpers";
import { Context } from "../types/ctx";

describe("Products", () => {
  let ctx: Context;
  const request = supertest(app);

  beforeAll(async () => {
    ctx = await makeCtx();
  });

  describe(Routes.products.get, () => {
    it("should return status code 404 if product informed does not exist", async () => {
      const resp = await request.get(`/products/${faker.random.word()}`);

      expect(resp.status).toBe(StatusCodes.NOT_FOUND);
      expect(resp.body.error).toBe(errors.products.notFound);
    });

    it("should return status code 200 if product informed does exist", async () => {
      const resp = await request.get(`/products/Broccoli`);

      expect(resp.status).toBe(StatusCodes.OKAY);
      expect(resp.body).toBeTruthy();
      expect(resp.body).toHaveProperty("name");
      expect(resp.body).toHaveProperty("price");
      expect(resp.body).toHaveProperty("quantity");
    });
  });
});
