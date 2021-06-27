import "https://deno.land/x/dotenv/load.ts";
import { client } from "./client.ts";
import type { FetchRequest } from "./client.ts";

interface FireRequest {
  collection?: string;
  id?: string;
}

type RequestInterface = FireRequest & Partial<FetchRequest>;

const firestore = {
  getDocument: async ({ authorization, collection, id }: RequestInterface) => {
    if (!collection) {
      throw new Error("Collection required");
    }
    if (!id) {
      throw new Error("ID Required");
    }
    return await client.request({
      method: "GET",
      url: `documents/${collection}/${id}`,
      authorization,
    });
  },
  getDocuementList: async ({ authorization }: RequestInterface) => {
    return await client.request({
      method: "GET",
      url: "documents/users/L0xO1Yri80WlrFSw6KxqccHhKhv2",
      authorization,
    });
  },
  deleteDocuement: async ({ authorization }: RequestInterface) => {
    return await client.request({
      method: "DELETE",
      url: "documents/users/L0xO1Yri80WlrFSw6KxqccHhKhv2",
      authorization,
    });
  },
  updateDocuement: async ({ authorization }: RequestInterface) => {
    return await client.request({
      method: "PATCH",
      url: "documents/users/L0xO1Yri80WlrFSw6KxqccHhKhv2",
      authorization,
    });
  },
};

export { firestore };
