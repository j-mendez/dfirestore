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
  log: RequestInterface & { res: object | undefined };
}

class FireStore extends EventEmitter<FireEvents> {
  async log(args: FireEvents["log"]) {
    if (config.eventLog) {
      await this.emit("log", args);
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

firestore.on(["log"], async (data: FireEvents["log"]) => {
  await fireMethods.createDocument({
    id: undefined,
    value: {
      id: { stringValue: data?.id },
      collection: { stringValue: data?.collection },
      json_data: { stringValue: JSON.stringify(data.res) },
      timestamp: { timestampValue: new Date() },
    },
    collection: "event_log",
  });
});

export { firestore };
