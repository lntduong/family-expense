export type PendingExpense = {
  id: string;
  payload: any;
};

const KEY = "fem-offline-queue";

export function enqueueExpense(item: PendingExpense) {
  if (typeof window === "undefined") return;
  const data = getQueue();
  data.push(item);
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getQueue(): PendingExpense[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearQueue() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
