declare namespace Express {
    export interface Request {
      knex: import("knex");
      db: import("../../types/repositories").Repositories;
    }
  }
