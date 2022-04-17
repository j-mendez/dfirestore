import "https://deno.land/x/dotenv@v2.0.0/load.ts";
import { client } from "./client.ts";
import { config } from "./config.ts";
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

const COLLECTION_ERROR = "Collection Required";
const ID_ERROR = "ID Required";

const validateRequest = ({
  collection,
  id,
}: Pick<RequestInterface, "collection" | "id">) => {
  if (!collection) {
    throw new Error(COLLECTION_ERROR);
  }
  if (!id) {
    throw new Error(ID_ERROR);
  }
};

const fireMethods = {
  createDocument: async ({
    authorization,
    collection,
    id,
    value,
    project,
  }: CreateDocument) => {
    if (!collection) {
      throw new Error(COLLECTION_ERROR);
    }
    return await client.request({
      method: "POST",
      url: `documents/${collection}${id ? `?documentId=${id}` : ""}`,
      authorization,
      reqBody: {
        fields: value,
      },
      project,
    });
  },
  deleteDocument: async ({
    authorization,
    collection,
    id,
    project,
  }: DeleteDocument) => {
    validateRequest({ collection, id });

    return await client.request({
      method: "DELETE",
      url: `documents/${collection}/${id}`,
      authorization,
      project,
    });
  },
  getDocument: async ({
    authorization,
    collection,
    id,
    mask,
    project,
    pageSize,
    pageToken,
    orderBy,
    showMissing,
  }: GetDocument) => {
    if (!collection) {
      throw new Error(COLLECTION_ERROR);
    }
    return await client.request({
      method: "GET",
      url: id ? `documents/${collection}/${id}` : `documents/${collection}`,
      authorization,
      project,
      pageSize,
      pageToken,
      orderBy,
      mask,
      showMissing,
    });
  },
  updateDocument: async ({
    authorization,
    collection,
    id,
    value,
    project,
  }: UpdateDocument) => {
    validateRequest({ collection, id });

    return await client.request({
      method: "PATCH",
      url: `documents/${collection}/${id}`,
      authorization,
      reqBody: {
        fields: value,
      },
      project,
    });
  },
  beginTransaction: async ({
    authorization,
    options,
    project,
  }: BeginTransaction) => {
    return await client.request({
      method: "POST",
      url: `documents:beginTransaction`,
      authorization,
      reqBody: {
        options,
      },
      project,
    });
  },
  commitTransaction: async ({
    authorization,
    writes,
    project,
    transaction,
  }: CommitTransaction) => {
    return await client.request({
      method: "POST",
      url: `documents:commit`,
      authorization,
      reqBody: {
        writes,
      },
      project,
      transaction,
    });
  },
  moveDocuments: async ({
    authorization,
    collectionIds,
    outputUriPrefix,
    project,
    type,
  }: MoveDocuments) => {
    return await client.request({
      method: "POST",
      url: `":${type ?? "export"}Documents`,
      authorization,
      reqBody: {
        collectionIds,
        outputUriPrefix,
      },
      project,
    });
  },
  rollback: async ({ transaction, authorization }: RollBack) => {
    return await client.request({
      method: "POST",
      url: "documents:rollback",
      authorization,
      reqBody: {
        transaction,
      },
    });
  },
};

class FireStore {
  async action(
    args: Arguements & Partial<RequestInterface>,
    event: FireEvents["event"]
  ) {
    const res = await fireMethods[event](args);

    if (config.eventLog) {
      const pr = {
        id: { stringValue: args?.id },
        collection: { stringValue: args?.collection },
        json_data: { stringValue: (res && JSON.stringify(res)) ?? "" },
        timestamp: { timestampValue: new Date() },
      };

      await fireMethods.createDocument({
        id: undefined,
        value: pr,
        collection: "event_log",
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

export { firestore };
