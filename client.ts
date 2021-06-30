import { config } from "./config.ts";

export interface FetchRequest extends Partial<Request> {
  url: string;
  database?: string;
  authorization?: string | boolean;
  reqBody?: object;
  project?: string;
  pageSize?: number;
  pageToken?: string;
}

const client = {
  request: async ({
    url,
    reqBody,
    method = "POST",
    database,
    authorization,
    project,
    pageSize,
    pageToken,
  }: FetchRequest): Promise<any> => {
    const requestHeaders: HeadersInit = new Headers();

    requestHeaders.set("Content-Type", "application/json");

    const token =
      typeof authorization !== "undefined" ? authorization : config.token;

    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }

    const size = pageSize ? `?pageSize=${Number(pageSize)}` : "";
    const page = pageToken ? `${size ? "&" : "?"}pageToken=${pageToken}` : "";

    const req = await fetch(
      `${config.host(project)}/databases/${
        database ?? config.firebaseDb
      }/${url}${size}${page}`,
      {
        method,
        body: reqBody && JSON.stringify(reqBody),
        headers: requestHeaders,
      }
    );

    return await req.json();
  },
};

export { client };
