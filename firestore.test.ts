import { assertEquals } from "./test_deps.ts";
import { firestore } from "./firestore.ts";
import {
  setToken,
  setTokenFromServiceAccount,
  setTokenFromEmailPassword,
} from "./config.ts";

const body = {
  collection: "users",
  id: "L0xO1Yri80WlrFSw6KxqccHhKhv2",
};

const t = await setTokenFromEmailPassword();

Deno.test({
  name: "firestore should run",
  fn: async () => {
    const d = await firestore.getDocument({ ...body });
    assertEquals(d.fields.firstname.stringValue, "Jeff");
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "firestore should error",
  fn: async () => {
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
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "firestore should invalidate admin account and error",
  fn: async () => {
    setToken("");
    const d = await firestore.getDocument({ ...body, authorization: false });
    assertEquals(d, {
      error: {
        code: 403,
        message: "Missing or insufficient permissions.",
        status: "PERMISSION_DENIED",
      },
    });
  },
});

Deno.test({
  name: "firestore should pass in token and fetch",
  fn: async () => {
    setToken("");
    const d = await firestore.getDocument({ ...body, authorization: t });
    assertEquals(d.fields.firstname.stringValue, "Jeff");
    // reset token
    setToken(t);
    const dt = await firestore.getDocument({ ...body });
    assertEquals(dt.fields.firstname.stringValue, "Jeff");
  },
});

Deno.test({
  name: "firestore should get list from collection",
  fn: async () => {
    const d = await firestore.getDocumentList({ collection: "users" });
    assertEquals(d.documents.length, 20);
  },
});

Deno.test({
  name: "firestore should update item from collection",
  fn: async () => {
    const d = await firestore.updateDocument({
      ...body,
      update: { lastname: { stringValue: "Jeff" } },
    });
    console.log(d);
    assertEquals(d.fields.lastname.stringValue, "Jeff");
  },
});

Deno.test({
  name: "firestore should get token from service account",
  fn: async () => {
    if (Boolean(Deno.env.get("CI")) === true) {
      const d = await setTokenFromEmailPassword();
      const v = d.slice(0, 4);
      assertEquals(v, "eyJh");
    } else {
      const d = await setTokenFromServiceAccount();
      const v = d.slice(0, 4);
      assertEquals(v, "ya29");
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
