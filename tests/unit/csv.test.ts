import { makeCtx } from "../helpers";
import { Context } from "../types/ctx";

const PRODUCTS_COUNT_FROM_CSV = 100;

describe("CSV Check", () => {
  let ctx: Context;

  beforeAll(async () => {
    ctx = await makeCtx();
  });

  it("expect that csv has been imported at database creation", async () => {
    const count = await ctx.db.products.count({});

    expect(count).toBe(PRODUCTS_COUNT_FROM_CSV);
  });
});
