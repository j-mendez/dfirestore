import { assertEquals, assertNotEquals } from "./test_deps.ts";
import { firestore } from "./firestore.ts";
import {
  FIREBASE_TOKEN,
  FIREBASE_REFRESH_RATE,
  setToken,
  setTokenFromServiceAccount,
  setTokenFromEmailPassword,
} from "./config.ts";

const body = {
  collection: "users",
  id: "L0xO1Yri80WlrFSw6KxqccHhKhv2",
};

const refreshRate = Number(Deno.env.get(FIREBASE_REFRESH_RATE || 1));

Deno.test("firestore", async (t: any) => {
  const authorization = await setTokenFromEmailPassword();

  await t.step("firestore should get token from auth", async () => {
    const tt = await setTokenFromEmailPassword();

    assertEquals(!!tt, true);
  });

  await t.step("firestore should create a new item in collection", async () => {
    const d = await firestore.createDocument({
      ...body,
      value: {
        firstname: { stringValue: "Jeff" },
        lastname: { stringValue: "Jeff" },
      },
    });
    if (d.error?.status === "ALREADY_EXISTS") {
      assertEquals(d.error.code, 409);
    } else {
      assertEquals(d.fields.lastname.stringValue, "Jeff");
    }
  });

  await t.step("firestore should run and fetch document", async () => {
    const d = await firestore.getDocument({ ...body });
    assertEquals(d.fields.firstname.stringValue, "Jeff");
  });

  await t.step("firestore should error", async () => {
    const d = await firestore.getDocument({
      ...body,
      authorization: false,
    });
    assertEquals(d, {
      error: {
        code: 403,
        message: "Missing or insufficient permissions.",
        status: "PERMISSION_DENIED",
      },
    });
  });

  await t.step(
    "firestore should invalidate admin account and error",
    async () => {
      setToken("");
      const d = await firestore.getDocument({
        ...body,
        authorization: false,
      });
      assertEquals(d, {
        error: {
          code: 403,
          message: "Missing or insufficient permissions.",
          status: "PERMISSION_DENIED",
        },
      });
    }
  );

  await t.step(
    "firestore should pass in token and fetch document",
    async () => {
      setToken("");
      const d = await firestore.getDocument({ ...body, authorization });
      assertEquals(d.fields.lastname.stringValue, "Jeff");
      // reset token
      setToken(authorization);
      const dt = await firestore.getDocument({ ...body });
      assertEquals(dt.fields.lastname.stringValue, "Jeff");
    }
  );

  await t.step("firestore should get list from collection", async () => {
    const d = await firestore.getDocument({ collection: "users" });
    assertEquals(d.documents.length, 1);
  });

  await t.step("firestore should update item from collection", async () => {
    const d = await firestore.updateDocument({
      ...body,
      value: {
        firstname: { stringValue: "Jeff" },
        lastname: { stringValue: "Jeff" },
      },
    });

    assertEquals(d.fields.lastname.stringValue, "Jeff");
  });

  await t.step("firestore should update item from collection", async () => {
    const d = await firestore.updateDocument({
      ...body,
      value: {
        firstname: { stringValue: "Jeff" },
        lastname: { stringValue: "Jeff" },
      },
    });

    assertEquals(d.fields.lastname.stringValue, "Jeff");
  });

  await t.step("firestore should get token from service account", async () => {
    if (Boolean(Deno.env.get("CI")) === true) {
      const d = await setTokenFromEmailPassword();
      const v = d.slice(0, 4);
      assertEquals(v, "eyJh");
    } else {
      const d = await setTokenFromServiceAccount();
      const v = d.slice(0, 4);
      assertEquals(v, "ya29");
    }
  });

  firestore?.workerLog?.postMessage({
    closeWorker: true,
  });
});

Deno.test({
  name: `firestore should refresh token and set env in ${refreshRate}s`,
  fn: async () => {
    const aa = await setTokenFromEmailPassword(undefined, true);
    assertEquals(aa, Deno.env.get(FIREBASE_TOKEN));
    setTimeout(() => {
      assertNotEquals(aa, Deno.env.get(FIREBASE_TOKEN));
      Deno.exit(0);
    }, refreshRate * 2000);
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// Deno.test({
//   name: "firestore should begin and commit transaction",
//   fn: async () => {
//     const d = await firestore.beginTransaction({});
//     assertEquals(typeof d.id, "string");
//     const c = await firestore.commitTransaction({
//       ...body,
//       transaction: d.id,
//     });

//     assertEquals(typeof c.id, "string");
//   },
// });
