import { config } from "./config.ts";

const { projectKey } = config;

const [tick, refreshToken] = Deno.args;

/*
 * Refetch token using refresh token
 */
export const refetchToken = async (params?: { refreshToken?: string }) => {
  const { refreshToken } = params ?? {};
  const baseUrl = "securetoken.googleapis.com/v1/token";

  const firebase = await fetch(`https://${baseUrl}?key=${projectKey}`, {
    headers: {
      contentType: "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const json = await firebase.json();

  const token = {
    expiresIn: json.expires_in,
    refreshToken: json.refresh_token,
    accessToken: json.id_token,
  };

  Deno.stdout.write(new TextEncoder().encode(JSON.stringify(token)));
};

setTimeout(
  async () => await refetchToken({ refreshToken }),
  Math.max(Number(tick) - 1, 1)
);
