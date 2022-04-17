import "https://deno.land/x/dotenv@v2.0.0/load.ts";
import { config } from "./config.ts";
import { fireMethods } from "./actions.ts";

import type {
  Arguements,
  BeginTransaction,
  CommitTransaction,
  CreateDocument,
  DeleteDocument,
  MoveDocuments,
  GetDocument,
  FireEvents,
  RequestInterface,
  RollBack,
  UpdateDocument,
} from "./types.ts";

class FireStore {
  constructor() {
    if (config.eventLog) {
      this.logWorker = new Worker(
        new URL("./worker.ts", import.meta.url).href,
        {
          type: "module",
          // @ts-ignore
          deno: {
            namespace: true,
            permissions: "inherit",
          },
        }
      );
    }
  }
  logWorker?: Worker;
  async action(
    args: Arguements & Partial<RequestInterface>,
    event: FireEvents["event"]
  ) {
    const res = await fireMethods[event](args);

    if (config.eventLog) {
      this?.logWorker?.postMessage({
        pr: {
          id: { stringValue: args?.id },
          collection: { stringValue: args?.collection },
          json_data: { stringValue: (res && JSON.stringify(res)) ?? "" },
          timestamp: { timestampValue: new Date() },
        },
      });
    }

    return res;
  }
  async beginTransaction(args: BeginTransaction) {
    return await this.action(args, "beginTransaction");
  }
  async commitTransaction(args: CommitTransaction) {
    return await this.action(args, "commitTransaction");
  }
  async createDocument(args: CreateDocument) {
    return await this.action(args, "createDocument");
  }
  async deleteDocument(args: DeleteDocument) {
    return await this.action(args, "deleteDocument");
  }
  async getDocument(args: GetDocument) {
    return await this.action(args, "getDocument");
  }
  async updateDocument(args: UpdateDocument) {
    return await this.action(args, "updateDocument");
  }
  async moveDocuments(args: MoveDocuments) {
    return await this.action(args, "moveDocuments");
  }
  async rollback(args: RollBack) {
    return await this.action(args, "rollback");
  }
}

const firestore = new FireStore();

export { fireMethods, firestore, FireStore };
