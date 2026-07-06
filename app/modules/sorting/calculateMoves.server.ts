import type {MoveInput} from "./sortingTypes";

function uniqueValidIds(ids: string[]) {
  const seen = new Set<string>();
  const uniqueIds: string[] = [];

  for (const id of ids) {
    if (typeof id !== "string" || !id.trim() || seen.has(id)) {
      continue;
    }

    seen.add(id);
    uniqueIds.push(id);
  }

  return uniqueIds;
}

export function normalizeTargetOrder(
  currentProductIds: string[],
  targetProductIds: string[],
) {
  const current = uniqueValidIds(currentProductIds);
  const currentSet = new Set(current);
  const target = uniqueValidIds(targetProductIds).filter((id) =>
    currentSet.has(id),
  );
  const targetSet = new Set(target);

  return [...target, ...current.filter((id) => !targetSet.has(id))];
}

export function calculateMoves(
  currentProductIds: string[],
  targetProductIds: string[],
): MoveInput[] {
  const working = uniqueValidIds(currentProductIds);
  const target = normalizeTargetOrder(working, targetProductIds);
  const moves: MoveInput[] = [];

  for (let desiredIndex = 0; desiredIndex < target.length; desiredIndex += 1) {
    const desiredId = target[desiredIndex];
    const currentIndex = working.indexOf(desiredId);

    if (currentIndex === -1 || currentIndex === desiredIndex) {
      continue;
    }

    working.splice(currentIndex, 1);
    working.splice(desiredIndex, 0, desiredId);
    moves.push({id: desiredId, newPosition: desiredIndex});
  }

  return moves;
}

export function applyMovesForTest(
  currentProductIds: string[],
  moves: MoveInput[],
) {
  const working = uniqueValidIds(currentProductIds);

  for (const move of moves) {
    const fromIndex = working.indexOf(move.id);
    if (fromIndex === -1) {
      continue;
    }

    const [productId] = working.splice(fromIndex, 1);
    const toIndex = Math.min(Math.max(move.newPosition, 0), working.length);
    working.splice(toIndex, 0, productId);
  }

  return working;
}
