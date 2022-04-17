import { fireMethods } from "./actions.ts";

self.onmessage = async (e) => {
  const { pr, closeWorker } = e.data;

  await fireMethods.createDocument({
    id: undefined,
    value: pr,
    collection: "event_log",
  });

  // if message to worker === close
  if (closeWorker) {
    self.close();
  }
};
