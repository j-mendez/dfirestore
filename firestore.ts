import "https://deno.land/x/dotenv/load.ts";
import { client } from "./client.ts";
import { config } from "./config.ts";
import type { RequestInterface, FireEvents } from "./types.ts";

const validateRequest = ({ collection, id }: RequestInterface) => {
  if (!collection) {
    throw new Error("Collection required");
  }
  if (!id) {
    throw new Error("ID Required");
  }
};

const fireMethods = {
  createDocument: async ({
    authorization,
    collection,
    id,
    value,
    project,
  }: RequestInterface) => {
    if (!collection) {
      throw new Error("Collection required");
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
  }: RequestInterface) => {
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
  }: RequestInterface) => {
    if (!collection) {
      throw new Error("Collection required");
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
  }: RequestInterface) => {
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
  }: RequestInterface) => {
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
  }: RequestInterface) => {
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
  async beginTransaction(args: RequestInterface) {
    const res = await fireMethods.beginTransaction(args);
    await this.log({ ...args, res });

    return res;
  }
  async commitTransaction(args: RequestInterface) {
    const res = await fireMethods.commitTransaction(args);
    await this.log({ ...args, res });

    return res;
  }
  async createDocument(args: RequestInterface) {
    const res = await fireMethods.createDocument(args);
    await this.log({ ...args, res });

    return res;
  }
  async deleteDocument(args: RequestInterface) {
    const res = await fireMethods.deleteDocument(args);
    await this.log({ ...args, res });

    return res;
  }
  async getDocument(args: RequestInterface) {
    const res = await fireMethods.getDocument(args);
    await this.log({ ...args, res });

    return res;
  }
  async updateDocument(args: RequestInterface) {
    const res = await fireMethods.updateDocument(args);
    await this.log({ ...args, res });

    return res;
  }
}

const firestore = new FireStore();

export { firestore };
