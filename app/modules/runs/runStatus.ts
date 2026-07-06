import type {SortRunStatus} from "@prisma/client";

export const RUN_STATUS_LABELS: Record<SortRunStatus, string> = {
  PENDING: "Pending",
  RUNNING: "Running",
  SUCCESS: "Success",
  FAILED: "Failed",
};

export function runStatusTone(status: SortRunStatus) {
  switch (status) {
    case "SUCCESS":
      return "success";
    case "FAILED":
      return "critical";
    case "RUNNING":
      return "info";
    case "PENDING":
      return "warning";
    default:
      status satisfies never;
      return "info";
  }
}
