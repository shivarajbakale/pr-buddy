/**
 * Quick script to verify Apollo values are in the database
 */

import { prisma } from "../src/utils/prisma.js";

async function main() {
  const values = await prisma.apolloValue.findMany({
    orderBy: { title: "asc" },
  });

  console.log(`\nFound ${values.length} Apollo values in database:\n`);
  values.forEach((value) => {
    console.log(`${value.title}`);
    console.log(`  → ${value.description}\n`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
