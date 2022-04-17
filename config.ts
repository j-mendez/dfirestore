export const FIREBASE_TOKEN = "FIREBASE_TOKEN";
export const FIREBASE_DATABASE = "FIREBASE_DATABASE";
export const FIREBASE_PROJECT_ID = "FIREBASE_PROJECT_ID";
export const FIREBASE_PROJECT_KEY = "FIREBASE_PROJECT_KEY";
export const FIREBASE_REFRESH_RATE = "FIREBASE_REFRESH_RATE";

let backgroundRefetchStarted = false;

const config = {
  firebaseDb: Deno.env.get("FIREBASE_DATABASE") || "(default)",
  host(project?: string) {
    return `https://firestore.googleapis.com/v1/projects/${
      project ?? this.projectID
    }`;
  },
  get token() {
    return Deno.env.get(FIREBASE_TOKEN);
  },
  get projectID() {
    return Deno.env.get(FIREBASE_PROJECT_ID);
  },
  get projectKey() {
    return Deno.env.get(FIREBASE_PROJECT_KEY);
  },
  get eventLog() {
    return Deno.env.get("FIREBASE_EVENT_LOG") == "true";
  },
};

const setProjectID = (id: string) => {
  Deno.env.set(FIREBASE_PROJECT_ID, id);
};

const setProjectKey = (key: string) => {
  Deno.env.set(FIREBASE_PROJECT_KEY, key);
};

const setToken = (token: string): string => {
  Deno.env.set(FIREBASE_TOKEN, token);
  return token;
};

const setDatabase = (db: string) => {
  Deno.env.set(FIREBASE_DATABASE, db);
};

/*
 * Login with your IAM account to establish user.
 * Required GoogleService-Info.plist
 */
const setTokenFromServiceAccount = async () => {
  const p = Deno.run({
    cmd: ["gcloud", "auth", "application-default", "print-access-token"],
    stdout: "piped",
    stderr: "piped",
    stdin: "piped",
  });

  const output = new TextDecoder().decode(await p.output());

  await p.close();

  const token = String(output).replace(/\\n/gm, "\n").replace("\n", "");

  setToken(token);

  return token;
};

/*
 * Login with your email and password to establish iam user
 */
const setTokenFromEmailPassword = async (
  params?: {
    email?: string;
    password?: string;
    refreshToken?: string;
    key?: string;
  },
  refresh?: boolean
) => {
  const { email, key, refreshToken, password } = params ?? {};

  let baseUrl = "";
  let body = {};

  if (typeof refreshToken !== "undefined") {
    baseUrl = "securetoken.googleapis.com/v1/token";
    body = {
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    };
  } else {
    baseUrl = "identitytoolkit.googleapis.com/v1/accounts:signInWithPassword";
    body = {
      email: email ?? Deno.env.get("FIREBASE_AUTH_EMAIL"),
      password: password ?? Deno.env.get("FIREBASE_AUTH_PASSWORD"),
      returnSecureToken: true,
    };
  }
  const firebase = await fetch(
    `https://${baseUrl}?key=${key ?? Deno.env.get(FIREBASE_PROJECT_KEY) ?? ""}`,
    {
      headers: {
        contentType: "application/json",
      },
      method: "POST",
      body: JSON.stringify(body),
    }
  );

  const json = await firebase.json();
  const token = json?.idToken;

  token && setToken(token);

  if (refresh) {
    queueMicrotask(() => {
      setRefetchBeforeExp({
        expiresIn: Deno.env.get(FIREBASE_REFRESH_RATE) || json.expiresIn,
        refreshToken: json.refreshToken,
      });
    });
  }

  return token;
};

type Token = {
  expiresIn: number;
  refreshToken: string;
};

// BACKGROUND PROCESS to refresh token
const setRefetchBeforeExp = async ({ expiresIn, refreshToken }: Token) => {
  const expMS = (expiresIn / 60) * 60000;

  if (!backgroundRefetchStarted) {
    const p = Deno.run({
      cmd: [
        "deno",
        "run",
        "--allow-read",
        "--allow-env",
        "--unstable",
        "--allow-net",
        "--allow-run",
        "--allow-write",
        "./refresh.ts",
        String(expMS),
        refreshToken,
      ],
      stdout: "piped",
      stderr: "piped",
    });

    try {
      const { code } = await p.status();
      const rawOutput = await p.output();
      const rawError = await p.stderrOutput();

      let jsonOutput;

      if (code === 0) {
        jsonOutput = JSON.parse(new TextDecoder().decode(rawOutput));
        if (jsonOutput && jsonOutput.accessToken) {
          Deno.env.set(FIREBASE_TOKEN, jsonOutput.accessToken);
        }
      } else {
        const errorString = new TextDecoder().decode(rawError);
        console.error(errorString);
      }

      backgroundRefetchStarted = false;
      // Recursively restart refetch
      await setRefetchBeforeExp(jsonOutput);
    } catch (e) {
      console.error(e);
    }
  }
  backgroundRefetchStarted = true;
};

export {
  config,
  setToken,
  setDatabase,
  setProjectID,
  setProjectKey,
  setRefetchBeforeExp,
  setTokenFromServiceAccount,
  setTokenFromEmailPassword,
};
