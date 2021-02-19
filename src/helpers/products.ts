import { ProductRepository } from "../repositories";
import { StockRoutes } from "../types/services";
import { formatProductName } from "./stock";

export async function storageManagement(productsRepository: ProductRepository, route: string, productName: string) {
  const name = formatProductName(productName).trim();

  if (route === StockRoutes.INCREMENTED) {
    await increaseProductQuantity(productsRepository, name);
  } else if (route === StockRoutes.DECREMENTED) {
    await decreaseProductQuantity(productsRepository, name);
  }
}

export async function increaseProductQuantity(productsRepository: ProductRepository, name: string) {
  const dbProduct = await productsRepository.findOneBy({ name });

  if (!dbProduct) {
    return console.log(`DBProduct Not Found: ${name}`);
  }

  await productsRepository.update({ id: dbProduct.id, quantity: dbProduct.quantity + 1 });
}

export async function decreaseProductQuantity(productsRepository: ProductRepository, name: string) {
  const dbProduct = await productsRepository.findOneBy({ name });

  if (!dbProduct) {
    return console.log(`DBProduct Not Found: ${name}`);
  }

  await productsRepository.update({
    id: dbProduct.id,
    quantity: dbProduct.quantity === 0 ? 0 : dbProduct.quantity - 1,
  });
}
