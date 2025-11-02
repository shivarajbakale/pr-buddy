/**
 * Database seed script for pr-buddy
 * Populates initial data including Apollo company values
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const apolloValues = [
  {
    title: '❌ Be "All for One"',
    description:
      "Prioritize team success over individual achievement and collaborate across boundaries.",
  },
  {
    title: "📄 Take Extreme Ownership",
    description:
      "Own outcomes completely, take responsibility without excuses, and follow through on commitments.",
  },
  {
    title: "😬 Be Customer Obsessed",
    description:
      "Deeply understand customer needs and make every decision through the lens of customer value.",
  },
  {
    title: "🥳 Speak and Act Courageously",
    description:
      "Voice opinions constructively, challenge the status quo, and take bold action despite uncertainty.",
  },
  {
    title: "🚀 Move with Focus and Urgency",
    description:
      "Execute with speed and prioritize ruthlessly to drive initiatives to completion.",
  },
  {
    title: "🪃 Learn Voraciously",
    description:
      "Embrace continuous learning, seek feedback actively, and adapt quickly to new information.",
  },
];

async function main() {
  console.log("Starting database seed...");

  // Seed Apollo Values
  console.log("Seeding Apollo values...");
  for (const value of apolloValues) {
    await prisma.apolloValue.upsert({
      where: { title: value.title },
      update: { description: value.description },
      create: value,
    });
    console.log(`✓ Seeded: ${value.title}`);
  }

  console.log("Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
