import { faker } from '@faker-js/faker';

export function generateMockProducts(count) {
  const products = [];
  for (let i = 0; i < count; i++) {
    products.push({
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      stock: faker.number.int({ min: 0, max: 100 }),
    });
  }
  return products;
}
