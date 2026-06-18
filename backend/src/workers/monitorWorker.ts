import { runMonitoringCycle } from "../services/monitorService.js";

export const MONITOR_INTERVAL_MS = 60_000;

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let cycleInProgress = false;

async function safeRunCycle(): Promise<void> {
  if (cycleInProgress) {
    console.warn("Monitoring cycle skipped: previous cycle still running");
    return;
  }

  cycleInProgress = true;
  try {
    await runMonitoringCycle();
  } catch (error) {
    console.error("Monitoring cycle failed:", error);
  } finally {
    cycleInProgress = false;
  }
}

export function startMonitorWorker(): void {
  if (intervalHandle) {
    return;
  }

  void safeRunCycle();

  intervalHandle = setInterval(() => {
    void safeRunCycle();
  }, MONITOR_INTERVAL_MS);

  console.log(
    `Monitor worker started (interval: ${MONITOR_INTERVAL_MS / 1000}s)`
  );
}

export function stopMonitorWorker(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}
