import "https://deno.land/x/dotenv/load.ts";
import { client } from "./client.ts";
import type { FetchRequest } from "./client.ts";
import { EventEmitter } from "./deps.ts";
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
  log: RequestInterface;
}

class FireStore extends EventEmitter<FireEvents> {
  async log(args: RequestInterface) {
    if (config.eventLog) {
      await this.emit("log", args);
    }
  }
  async createDocument(args: RequestInterface) {
    const [_, data] = await Promise.all([
      this.log(args),
      fireMethods.createDocument(args),
    ]);

    return data;
  }
  async deleteDocument(args: RequestInterface) {
    const [_, data] = await Promise.all([
      this.log(args),
      fireMethods.deleteDocument(args),
    ]);

    return data;
  }
  async getDocument(args: RequestInterface) {
    const [_, data] = await Promise.all([
      this.log(args),
      fireMethods.getDocument(args),
    ]);

    return data;
  }
  async updateDocument(args: RequestInterface) {
    const [_, data] = await Promise.all([
      this.log(args),
      fireMethods.updateDocument(args),
    ]);

    return data;
  }
}

const firestore = new FireStore();

firestore.on(["log"], async (data: RequestInterface) => {
  await fireMethods.createDocument({
    id: undefined,
    value: {
      id: { stringValue: data?.id },
      collection: { stringValue: data?.collection },
      json_data: { stringValue: JSON.stringify(data) },
      timestamp: { timestampValue: new Date() },
    },
    collection: "event_log",
  });
});

export { firestore };
