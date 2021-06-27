const FIREBASE_TOKEN = "FIREBASE_TOKEN";
const FIREBASE_DATABASE = "FIREBASE_DATABASE";
const FIREBASE_PROJECT_ID = "FIREBASE_PROJECT_ID";

const projectID = Deno.env.get(FIREBASE_PROJECT_ID) ?? "";

const config = {
  firebaseDb: Deno.env.get("FIREBASE_DATABASE") ?? "(default)",
  token: Deno.env.get(FIREBASE_TOKEN),
  host: `https://firestore.googleapis.com/v1/projects/${projectID}`,
};

const setProjectID = (id: string) => {
  Deno.env.set(FIREBASE_PROJECT_ID, id);
};

const setToken = (token: string) => {
  Deno.env.set(FIREBASE_TOKEN, token);
};

const setDatabase = (db: string) => {
  Deno.env.set(FIREBASE_DATABASE, db);
};

export { config, setToken, setDatabase, setProjectID };
