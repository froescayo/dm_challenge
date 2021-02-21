import { instances } from "./knex";
import { initialPopulate } from "./populate";

initialPopulate()
  .then(() => {
    console.log("Products inserted.");
  })
  .catch(err => {
    console.log(err);
  })
  .finally(async () => {
    await Promise.all(instances.map(async i => i.destroy()));
  });
