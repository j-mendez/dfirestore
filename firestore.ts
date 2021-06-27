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
  getDocument: async ({
    authorization,
    collection,
    id,
    project,
  }: RequestInterface) => {
    validateRequest({ collection, id });

    return await client.request({
      method: "GET",
      url: `documents/${collection}/${id}`,
      authorization,
      project,
    });
  },
  getDocumentList: async ({
    authorization,
    collection,
    project,
  }: RequestInterface) => {
    if (!collection) {
      throw new Error("Collection required");
    }
    return await client.request({
      method: "GET",
      url: `documents/${collection}`,
      authorization,
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
  createDocument: async ({
    authorization,
    collection,
    id,
    value,
    project,
  }: RequestInterface) => {
    validateRequest({ collection, id });

    return await client.request({
      method: "POST",
      url: `documents/${collection}?documentId=${id}`,
      authorization,
      reqBody: {
        fields: value,
      },
      project,
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

export { firestore };
