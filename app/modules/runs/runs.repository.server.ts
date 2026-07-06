import type {Prisma, SortRunStatus} from "@prisma/client";

import prisma from "../../db.server";

export async function listRuns(shopDomain: string) {
  return prisma.sortRun.findMany({
    where: {shopDomain},
    include: {rule: true},
    orderBy: {createdAt: "desc"},
    take: 100,
  });
}

export async function createSortRun(data: Prisma.SortRunUncheckedCreateInput) {
  return prisma.sortRun.create({data});
}

export async function markRunRunning(runId: string) {
  return updateRunStatus(runId, "RUNNING", {
    startedAt: new Date(),
  });
}

export async function markRunSuccess(
  runId: string,
  data: Pick<Prisma.SortRunUncheckedUpdateInput, "productsAnalyzed" | "productsMoved">,
) {
  return updateRunStatus(runId, "SUCCESS", {
    ...data,
    completedAt: new Date(),
  });
}

export async function markRunFailed(runId: string, errorMessage: string) {
  return updateRunStatus(runId, "FAILED", {
    errorMessage,
    completedAt: new Date(),
  });
}

async function updateRunStatus(
  runId: string,
  status: SortRunStatus,
  data: Prisma.SortRunUncheckedUpdateInput,
) {
  return prisma.sortRun.update({
    where: {id: runId},
    data: {status, ...data},
  });
}

export async function getLatestRunByStatus(
  shopDomain: string,
  status: SortRunStatus,
) {
  return prisma.sortRun.findFirst({
    where: {shopDomain, status},
    include: {rule: true},
    orderBy: {completedAt: "desc"},
  });
}

export async function countRuns(shopDomain: string) {
  return prisma.sortRun.count({where: {shopDomain}});
}
