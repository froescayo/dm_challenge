import ExcelJs from "exceljs";
import path from "path";
import Knex from "knex";
import { v4 as uuid } from "uuid";
import { env } from "./env";

const knex = Knex({
    client: 'pg',
    connection: {
        database : process.env.NODE_ENV && process.env.NODE_ENV === "test" ? `test_${uuid()}` : env.DB_DATABASE,
        host : env.DB_HOST,
        user : env.DB_USERNAME,
        password :  env.DB_PASSWORD,
        port: parseInt(env.DB_PORT || "5432", 10),
    },
    migrations: {
        directory: "src/migrations",
        extension: "ts",
    }
});

export async function initialPopulate() {
    const workbook = new ExcelJs.Workbook();
    const worksheet = await workbook.csv.readFile(path.join(__dirname, "..", "..", "products.csv"));
    const productsFromCsv : Array<{ id: string; name: string; price: number; quantity: number; }> = [];

    worksheet.spliceRows(1, 1);
    worksheet.eachRow((row) => {
        const values = JSON.stringify(row.values);
        const [, name, price, quantity] = JSON.parse(values);

        productsFromCsv.push({ id: uuid(), name, price: parseFloat(price), quantity: parseInt(quantity, 10)});
    });

    const exists = await knex("products").whereIn("name", productsFromCsv.map(cur => cur.name));

    if (exists.length > 0) {
        throw new Error(`It was not possible to insert those products due one or more of them already exists:${exists.map(cur => {
            return ` ${cur.name}`
        })}`);
    }

    await knex("products").insert(productsFromCsv);
}

initialPopulate().then(() => { console.log("Products inserted.") }).catch(err => {
    console.log(err);
    process.exit(1);
});