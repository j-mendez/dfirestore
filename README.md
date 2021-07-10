# dfirestore

![test workflow](https://github.com/j-mendez/dfirestore/actions/workflows/test.yml/badge.svg)
[![Maintainability](https://api.codeclimate.com/v1/badges/ed5ddd5e541f49f61382/maintainability)](https://codeclimate.com/github/j-mendez/dfirestore/maintainability)

a deno [Firestore](https://firebase.google.com/docs/firestore) REST client

## Usage

To get started with the package you can either setup the application with your tokens or authenticate with one of the helpers.
After you authenticate you can freely use the REST client and your access tokens will rotate before they expire.
For examples of values to use when perform creates/updates can be found at [Firestore Value Docs](https://firebase.google.com/docs/firestore/reference/rest/v1/Value)

### Configuration

All pre-configuration settings are optional. You should use `setProjectID` to establish your project if you are going to use the same one for every request. If you the second param for `setTokenFromEmailPassword` is set to true you need to make sure you have read and write permissions since we currently use a sub process that needs the permissions to store the new token before expiration. Make sure to start deno with the following `--unstable --allow-run --allow-net=firestore.googleapis.com,identitytoolkit.googleapis.com` to allow network request to firestore.

```typescript
import {
  setDatabase,
  setToken,
  setProjectID,
  setProjectKey,
  setTokenFromServiceAccount,
  setTokenFromEmailPassword,
} from "https://deno.land/x/dfirestore/mod.ts";

/*
 * CONFIGURATION: Add authentication token for all request.
 * Use one of the `setToken` methods below all configs are optional.
 */

// Optional: If GoogleService-Info.plist and gcloud installed on machine run to get service token
setTokenFromServiceAccount();
// Optional: If Email and Password secret shared. Optional params when using env variables
setTokenFromEmailPassword(
  {
    email: "someemail@something.com",
    password: "something",
  },
  true // background refresh token before expiration
);
// Optional: Manually set authentication from access token (jwt)
setToken("someidtoken");

// Optional: set db
setDatabase("(default)");
// Optional: set global project id for all request - nice to use.
setProjectID("my_project_id");
// Optional: set project web key or use the env FIREBASE_PROJECT_KEY
setProjectKey("mywebprojectkey");
```

### Client

Use the REST client below via the following methods to perform CRUD operations.

```typescript
import { firestore } from "https://deno.land/x/dfirestore/mod.ts";

// add new document: Check firebase param values for list key types ex (stringValue).
await firestore.createDocument({
  collection: "users",
  id: "L0xO1Yri80WlrFSw6KxqccHhKhv2",
  value: { firstname: { stringValue: "Jeff" } },
});
// get document in collection by id
await firestore.getDocument({
  collection: "users",
  id: "L0xO1Yri80WlrFSw6KxqccHhKhv2",
});
// get document collection list
await firestore.getDocument({
  collection: "users",
  pageSize: 10, // optional: page limit
  pageToken: "thepagetokenfornextpage", // optional: page token to get the next page
  orderBy: "desc", // optional: order desc, key, etc
  showMissing: false, // optional: show missing props
  mask: { fieldPaths: ["id", "name"] }, // optional: mask the object fields
});
// delete document by id
await firestore.deleteDocument({
  collection: "users",
  id: "L0xO1Yri80WlrFSw6KxqccHhKhv2",
});
// update document in collection by id
await firestore.updateDocument({
  collection: "users",
  id: "L0xO1Yri80WlrFSw6KxqccHhKhv2",
  value: { firstname: { stringValue: "Jeff" } },
});
// update document in collection by id for set projectID
await firestore.updateDocument({
  collection: "users",
  id: "L0xO1Yri80WlrFSw6KxqccHhKhv2",
  project: "someproj",
  value: { firstname: { stringValue: "Jeff" } },
});
// move documents import/export may require admin account token
await firestore.moveDocuments({
  collectionIds: undefined, // export all documents
  outputUriPrefix: "gs://BUCKET_NAME[/NAMESPACE_PATH]", // replace with your bucket name and namespace
  type: "export",
});
```

## Environment Variables

The environment variables below will help setup the project defaults so you do not have to manually configure at the application level. If you are not going to setup any of the envs below you need to make sure you pass in the required params.

### Project

```
FIREBASE_DATABASE=(default)
FIREBASE_PROJECT_ID=
FIREBASE_PROJECT_KEY=
```

### Authentication

```
FIREBASE_AUTH_EMAIL=
FIREBASE_AUTH_PASSWORD=
```

### Explicit Access Token

```
FIREBASE_TOKEN=
```

### Events

Log all events (creates a log document on every event )

```
FIREBASE_EVENT_LOG=true
```
