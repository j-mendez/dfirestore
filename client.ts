import { config } from "./config.ts";

export interface FetchRequest extends Partial<Request> {
  url: string;
  database?: string;
  authorization?: string | boolean;
}

const client = {
  request: async ({
    url,
    body,
    method = "POST",
    database,
    authorization,
  }: FetchRequest): Promise<any> => {
    const requestHeaders: HeadersInit = new Headers();

    requestHeaders.set("Content-Type", "application/json");

    const token =
      typeof authorization !== "undefined" ? authorization : config.token;

    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }

    const req = await fetch(
      `${config.host}/databases/${database ?? config.firebaseDb}/${url}`,
      {
        method,
        body: body && JSON.stringify(body),
        headers: requestHeaders,
      }
    );

    const json = await req.json();

    return json;
  },
};

export { client };
