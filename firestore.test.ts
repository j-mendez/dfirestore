import { assertEquals } from "./test_deps.ts";
import { firestore } from "./firestore.ts";
import { setToken } from "./config.ts";

const body = {
  collection: "users",
  id: "L0xO1Yri80WlrFSw6KxqccHhKhv2",
};

Deno.test({
  name: "firestore should run",
  fn: async () => {
    const d = await firestore.getDocument(body);
    assertEquals(d.fields.firstname.stringValue, "Jeff");
  },
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
});
