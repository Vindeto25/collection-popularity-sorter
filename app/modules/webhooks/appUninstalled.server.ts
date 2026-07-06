import prisma from "../../db.server";

export async function handleAppUninstalled(shopDomain: string) {
  await prisma.$transaction([
    prisma.sortRule.updateMany({
      where: {shopDomain},
      data: {enabled: false, nextRunAt: null},
    }),
    prisma.session.deleteMany({
      where: {shop: shopDomain},
    }),
  ]);
}
