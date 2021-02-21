import ExcelJs from "exceljs";
import Knex from "knex";
import path from "path";
import { v4 as uuid } from "uuid";
import { databaseName } from "../knex";
import { getKnexInstance } from "./knex";

export async function initialPopulate(knex?: Knex) {
  let knexInstance: Knex = knex ? knex : getKnexInstance(databaseName);

  try {
    await knexInstance.migrate.latest();

    const workbook = new ExcelJs.Workbook();
    const worksheet = await workbook.csv.readFile(path.join(__dirname, "..", "..", "products.csv"));
    const productsFromCsv: Array<{ id: string; name: string; price: number; quantity: number }> = [];

    worksheet.spliceRows(1, 1);
    worksheet.eachRow(row => {
      const values = JSON.stringify(row.values);
      const [, name, price, quantity] = JSON.parse(values);

      productsFromCsv.push({ id: uuid(), name, price: parseFloat(price), quantity: parseInt(quantity, 10) });
    });

    const exists = await knexInstance("products").whereIn(
      "name",
      productsFromCsv.map(cur => cur.name),
    );

    if (exists.length > 0) {
      throw new Error(
        `It was not possible to insert those products due to one or more of them already exists:${exists.map(cur => {
          return ` ${cur.name}`;
        })}`,
      );
    }

    await knexInstance("products").insert(productsFromCsv);
  } catch (error) {
    console.log(error);
  }
}
