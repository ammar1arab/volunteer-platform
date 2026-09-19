import { prisma } from "@/infrastructure/persistence/prisma/client";

async function run() {
  const cities = await prisma.volunteerProfile.groupBy({
    by: ["city"],
    _count: { _all: true },
    orderBy: { _count: { city: "desc" } }
  });
  console.log("CITIES IN DATABASE:\n", JSON.stringify(cities, null, 2));

  const cityAge = await prisma.$queryRaw`
    SELECT city, COUNT(*)::int AS count
    FROM volunteer_profiles
    GROUP BY city
    ORDER BY count DESC
  `;
  console.log("RAW CITY COUNTS:\n", JSON.stringify(cityAge, null, 2));
}

run().finally(() => prisma.$disconnect());
