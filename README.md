# dfirestore

a deno Firebase Firestore client #WIP do not use in production

## Usage

```typescript
import {
  setDatabase,
  setToken,
  setProjectID,
  firestore,
} from "https://deno.land/dfirestore/mod.ts";

// set firebase db
setDatabase("(default)");

// set firebase project
setProjectID("myprojectid");

// set authorization
setToken("FIREBASE_AUTHORIZATION_TOKEN");

await firestore.getDocument("document/id");
await firestore.getDocumentList("document");
await firestore.deleteDocument("document/id");
await firestore.updateDocument("document/id");
```

## ENV variables

FIREBASE_DATABASE=
FIREBASE_PROJECT_ID=
FIREBASE_TOKEN=
