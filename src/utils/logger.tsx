export const APP_LOG_TAG = "CRUSTEEZ_APP";

type LogLevel = "LOG" | "WARN" | "ERROR";

interface AppLogEntry {
  id: number;
  level: LogLevel;
  message: string;
  time: string;
}

const MAX_LOGS = 500;
let logs: AppLogEntry[] = [];
let logId = 0;

function addLog(level: LogLevel, message: string) {
  logs.unshift({
    id: ++logId,
    level,
    message: `${APP_LOG_TAG}: ${message}`, // <-- prepend app tag here
    time: new Date().toISOString(),
  });

  if (logs.length > MAX_LOGS) {
    logs.pop();
  }
}

/* Public API */

export function appLog(...args: any[]) {
  const msg = args.map(String).join(" ");
  console.log(`${APP_LOG_TAG}: ${msg}`);
  addLog("LOG", msg);
}

export function appWarn(...args: any[]) {
  const msg = args.map(String).join(" ");
  console.warn(`${APP_LOG_TAG}: ${msg}`);
  addLog("WARN", msg);
}

export function appError(...args: any[]) {
  const msg = args.map(String).join(" ");
  console.error(`${APP_LOG_TAG}: ${msg}`);
  addLog("ERROR", msg);
}

export function getAppLogs() {
  return logs;
}

export function clearAppLogs() {
  logs = [];
}
