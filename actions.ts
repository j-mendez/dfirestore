import "https://deno.land/x/dotenv@v2.0.0/load.ts";
import { client } from "./client.ts";
import type {
  BeginTransaction,
  CommitTransaction,
  CreateDocument,
  DeleteDocument,
  MoveDocuments,
  GetDocument,
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

export const fireMethods = {
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
