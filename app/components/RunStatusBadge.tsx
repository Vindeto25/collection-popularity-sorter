import type {SortRunStatus} from "@prisma/client";

import {runStatusTone, RUN_STATUS_LABELS} from "../modules/runs/runStatus";

export function RunStatusBadge({status}: {status: SortRunStatus}) {
  return <s-badge tone={runStatusTone(status)}>{RUN_STATUS_LABELS[status]}</s-badge>;
}
