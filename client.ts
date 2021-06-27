import { config } from "./config.ts";

export interface FetchRequest extends Partial<Request> {
  url: string;
  database?: string;
  authorization?: string | boolean;
  reqBody?: object;
}

const client = {
  request: async ({
    url,
    reqBody,
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
        body: reqBody && JSON.stringify(reqBody),
        headers: requestHeaders,
      }
    );

    const json = await req.json();

    return json;
  },
};

export { client };
