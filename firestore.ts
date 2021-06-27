import "https://deno.land/x/dotenv/load.ts";
import { client } from "./client.ts";
import type { FetchRequest } from "./client.ts";

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

const firestore = {
  getDocument: async ({ authorization, collection, id }: RequestInterface) => {
    validateRequest({ collection, id });

    return await client.request({
      method: "GET",
      url: `documents/${collection}/${id}`,
      authorization,
    });
  },
  getDocumentList: async ({ authorization, collection }: RequestInterface) => {
    if (!collection) {
      throw new Error("Collection required");
    }
    return await client.request({
      method: "GET",
      url: `documents/${collection}`,
      authorization,
    });
  },
  deleteDocument: async ({
    authorization,
    collection,
    id,
  }: RequestInterface) => {
    validateRequest({ collection, id });

    return await client.request({
      method: "DELETE",
      url: `documents/${collection}/${id}`,
      authorization,
    });
  },
  updateDocument: async ({
    authorization,
    collection,
    id,
    value,
  }: RequestInterface) => {
    validateRequest({ collection, id });

    return await client.request({
      method: "PATCH",
      url: `documents/${collection}/${id}`,
      authorization,
      reqBody: {
        name: id,
        fields: value,
      },
    });
  },
};

export { firestore };
