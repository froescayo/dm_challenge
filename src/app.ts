import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import knex from "./knex";
import { config } from "./middlewares/config";
import routes from "./routes";

const app = express();

app.use(cors());

app.get("/", (_, res) => { res.status(200).json({ version: 1 } ).end()});

app.use(helmet());
app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(config(knex));
app.use(routes);

export default app;
