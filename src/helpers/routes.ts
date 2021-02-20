export const Routes = {
  products: {
    get: "/products/:name",
  },
  orders: {
    get: "/orders",
    getParticularOrder: "/orders/:id",
    post: "/orders",
  },
};
