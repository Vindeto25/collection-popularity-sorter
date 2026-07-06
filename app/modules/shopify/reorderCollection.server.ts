import type {AdminGraphqlClient} from "./adminClient.server";
import {graphqlRequest, userErrorsToMessage} from "./adminClient.server";
import {updateCollectionSortOrderToManual} from "./collections.server";
import type {MoveInput} from "../sorting/sortingTypes";

const MAX_MOVES_PER_MUTATION = 250;

function chunkMoves(moves: MoveInput[]) {
  const chunks: MoveInput[][] = [];
  for (let index = 0; index < moves.length; index += MAX_MOVES_PER_MUTATION) {
    chunks.push(moves.slice(index, index + MAX_MOVES_PER_MUTATION));
  }
  return chunks;
}

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function pollJob(
  admin: AdminGraphqlClient,
  jobId: string,
  options: {maxAttempts?: number; delayMs?: number} = {},
) {
  const maxAttempts = options.maxAttempts ?? 30;
  const delayMs = options.delayMs ?? 1000;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const data = await graphqlRequest<{
      job: {id: string; done: boolean} | null;
    }>(
      admin,
      `#graphql
        query PollJob($id: ID!) {
          job(id: $id) {
            id
            done
          }
        }
      `,
      {id: jobId},
    );

    if (!data.job) {
      throw new Error(`Shopify job ${jobId} was not found.`);
    }

    if (data.job.done) {
      return data.job;
    }

    await delay(delayMs);
  }

  throw new Error(`Shopify job ${jobId} did not finish before the timeout.`);
}

async function reorderBatch(
  admin: AdminGraphqlClient,
  collectionId: string,
  moves: MoveInput[],
) {
  const data = await graphqlRequest<{
    collectionReorderProducts: {
      job: {id: string} | null;
      userErrors: Array<{field?: string[] | null; message: string}>;
    };
  }>(
    admin,
    `#graphql
      mutation ReorderCollectionProducts($id: ID!, $moves: [MoveInput!]!) {
        collectionReorderProducts(id: $id, moves: $moves) {
          job {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {id: collectionId, moves},
  );

  const userError = userErrorsToMessage(
    data.collectionReorderProducts.userErrors,
  );
  if (userError) {
    throw new Error(userError);
  }

  return data.collectionReorderProducts.job;
}

export async function reorderCollectionProducts(
  admin: AdminGraphqlClient,
  collectionId: string,
  moves: MoveInput[],
) {
  await updateCollectionSortOrderToManual(admin, collectionId);

  const jobs: Array<{id: string}> = [];
  for (const batch of chunkMoves(moves)) {
    const job = await reorderBatch(admin, collectionId, batch);
    if (job) {
      await pollJob(admin, job.id);
      jobs.push(job);
    }
  }

  return jobs;
}
