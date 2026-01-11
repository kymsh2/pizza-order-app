export const APP_LOG_TAG = "CRUSTEEZ_APP";

export function appLog(...args: any[]) {
  console.log(`[${APP_LOG_TAG}]`, ...args);
}
