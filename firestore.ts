import "https://deno.land/x/dotenv/load.ts";
import { client } from "./client.ts";
import { config } from "./config.ts";
import type {
  BeginTransaction,
  CommitTransaction,
  CreateDocument,
  DeleteDocument,
  MoveDocuments,
  GetDocument,
  FireEvents,
  RequestInterface,
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
  exportDocuments: async ({
    authorization,
    collectionIds,
    outputUriPrefix,
  }: MoveDocuments) => {
    return await client.request({
      method: "POST",
      url: ":exportDocuments",
      authorization,
      reqBody: {
        collectionIds,
        outputUriPrefix,
      },
    });
  },
  importDocuments: async ({
    authorization,
    collectionIds,
    outputUriPrefix,
  }: MoveDocuments) => {
    return await client.request({
      method: "POST",
      url: ":importDocuments",
      authorization,
      reqBody: {
        collectionIds,
        outputUriPrefix,
      },
    });
  },
};

class FireStore {
  async log({ id, collection, res }: FireEvents["log"]) {
    if (config.eventLog) {
      await fireMethods.createDocument({
        id: undefined,
        value: {
          id: { stringValue: id },
          collection: { stringValue: collection },
          json_data: { stringValue: JSON.stringify(res) },
          timestamp: { timestampValue: new Date() },
        },
        collection: "event_log",
      });
    }
    Promise.resolve();
  }
  async beginTransaction(args: BeginTransaction) {
    const res = await fireMethods.beginTransaction(args);
    await this.log({ ...args, res });

    return res;
  }
  async commitTransaction(args: CommitTransaction) {
    const res = await fireMethods.commitTransaction(args);
    await this.log({ ...args, res });

    return res;
  }
  async createDocument(args: CreateDocument) {
    const res = await fireMethods.createDocument(args);
    await this.log({ ...args, res });

    return res;
  }
  async deleteDocument(args: DeleteDocument) {
    const res = await fireMethods.deleteDocument(args);
    await this.log({ ...args, res });

    return res;
  }
  async getDocument(args: GetDocument) {
    const res = await fireMethods.getDocument(args);
    await this.log({ ...args, res });

    return res;
  }
  async updateDocument(args: UpdateDocument) {
    const res = await fireMethods.updateDocument(args);
    await this.log({ ...args, res });

    return res;
  }
  async exportDocuments(args: MoveDocuments) {
    const res = await fireMethods.exportDocuments(args);
    await this.log({ ...args, res });

    return res;
  }
  async importDocuments(args: MoveDocuments) {
    const res = await fireMethods.importDocuments(args);
    await this.log({ ...args, res });

    return res;
  }
}

const firestore = new FireStore();

export { firestore };
