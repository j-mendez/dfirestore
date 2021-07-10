const FIREBASE_TOKEN = "FIREBASE_TOKEN";
const FIREBASE_DATABASE = "FIREBASE_DATABASE";
const FIREBASE_PROJECT_ID = "FIREBASE_PROJECT_ID";
const FIREBASE_PROJECT_KEY = "FIREBASE_PROJECT_KEY";
const firebaseAuthTokenPath = "./firebase_auth_token.json";
const descriptor = {
  name: "read",
  path: firebaseAuthTokenPath,
} as const;

const readAuthStatus = await Deno.permissions.query(descriptor);
const writeAuthStatus = await Deno.permissions.query({
  ...descriptor,
  name: "write",
});

let readAuthAllowed = false;
let writeAuthAllowed = false;
let backgroundRefetchStarted = false;

if (readAuthStatus.state === "granted") {
  readAuthAllowed = true;
}

if (writeAuthStatus.state === "granted") {
  writeAuthAllowed = true;
}

const config = {
  firebaseDb: Deno.env.get("FIREBASE_DATABASE") ?? "(default)",
  host(project?: string) {
    return `https://firestore.googleapis.com/v1/projects/${
      project ?? this.projectID
    }`;
  },
  get token() {
    return this.storedToken?.id_token ?? Deno.env.get(FIREBASE_TOKEN);
  },
  get projectID() {
    return Deno.env.get(FIREBASE_PROJECT_ID);
  },
  get storedToken() {
    try {
      const file = readAuthAllowed && Deno.readTextFileSync(descriptor.path);
      return file ? JSON.parse(file) : null;
    } catch (_e) {
      return null;
    }
  },
  get eventLog() {
    return Boolean(Deno.env.get("FIREBASE_EVENT_LOG"));
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
  if (writeAuthAllowed) {
    Deno.writeTextFileSync(
      "./firebase_auth_token.json",
      JSON.stringify({ id_token: token })
    );
  }
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
    setRefetchBeforeExp({
      expiresIn: json.expiresIn,
      refreshToken: json.refreshToken,
    });
  }

  return token;
};

type Token = {
  expiresIn: number;
  refreshToken: string;
};

// TODO: GET PID ACCESS TO VAR FOR HARD STOP
const setRefetchBeforeExp = ({ expiresIn, refreshToken }: Token) => {
  const expMS = (expiresIn / 60) * 60000;

  if (!backgroundRefetchStarted) {
    Deno.run({
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
    });
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
