// The three first-run steps. Shown once, and only to someone who has nothing saved yet:
// a visitor who has been using the app is never put through them.
export const ONBOARDED_KEY = "noor.onboarded.v1";
const SIGNS_OF_USE = ["noor.lastRead.v1", "noor.recent.v1", "noor.place.v1", "noor.settings.v1", "noor.khatm.v1", "noor.routine.v1", "noor.bookmarks.v1", "noor.tasbih.v1"];
export const PAGE_GOALS = [1, 5, 20] as const;

export const needsOnboarding = (store: Pick<Storage, "getItem">) => store.getItem(ONBOARDED_KEY) === null && SIGNS_OF_USE.every((key) => store.getItem(key) === null);
