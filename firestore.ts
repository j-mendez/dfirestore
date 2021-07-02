import "https://deno.land/x/dotenv/load.ts";
import { client } from "./client.ts";
import type { FetchRequest } from "./client.ts";
import { config } from "./config.ts";

interface FireRequest {
  collection?: string;
  id?: string;
  value?: object;
}

type RequestInterface = FireRequest & Partial<FetchRequest>;

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
};

interface FireEvents {
  log: RequestInterface & { res: object | undefined };
}

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
