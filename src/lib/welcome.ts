/** The welcome screen is shown on the first visit of each day. */
export const WELCOME_KEY = "noor.welcome.v1";

export const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

export function showWelcome() {
  document.documentElement.dataset.welcome = "1";
}

export function dismissWelcome() {
  delete document.documentElement.dataset.welcome;
  try {
    window.localStorage.setItem(WELCOME_KEY, dayKey(new Date()));
  } catch {
    // Storage blocked: it will simply greet again next time.
  }
}
