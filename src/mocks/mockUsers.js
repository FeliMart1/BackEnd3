import { faker } from '@faker-js/faker';

export function generateMockUsers(count) {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push({
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      age: faker.number.int({ min: 18, max: 80 }),
    });
  }
  return users;
}
