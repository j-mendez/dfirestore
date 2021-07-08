import { setRefetchBeforeExp, projectkey } from "./config.ts";

const [tick, refreshToken] = Deno.args;

/**
 * write.ts
 */
async function writeJson(
  path: string,
  data: Record<string, unknown>
): Promise<string> {
  try {
    await Deno.writeTextFile(path, JSON.stringify(data));

    return path;
  } catch (e) {
    return e.message;
  }
}

/*
 * Refetch token using refresh token
 */
export const refetchToken = async (params?: { refreshToken?: string }) => {
  const { refreshToken } = params ?? {};
  const baseUrl = "securetoken.googleapis.com/v1/token";

  const firebase = await fetch(`https://${baseUrl}?key=${projectkey}`, {
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

  json && (await writeJson("./firebase_auth_token.json", json));

  await setRefetchBeforeExp({
    expiresIn: json.expires_in,
    refreshToken: json.refresh_token,
  });

  await Deno.kill(Deno.pid, Deno.Signal.SIGINT);
};

setTimeout(
  async () => await refetchToken({ refreshToken }),
  Math.max(Number(tick) - 1, 1)
);
