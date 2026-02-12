import { getPrisma } from "../src/db/prisma";
import { env } from "../src/config/env";

const prisma = getPrisma();

beforeAll(async () => {
  void env.JWT_SECRET;
  await prisma.$connect();
});

beforeEach(async () => {
  await prisma.taskDependency.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
