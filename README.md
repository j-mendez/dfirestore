# dfirestore

a deno Firebase Firestore REST client

## Usage

To get started with the package you can either setup the application with your tokens or authenticate with one of the helpers.
After you authenticate you can freely use the REST client and your access tokens will rotate before they expire.

### Configuration

All configuration settings are optional if you are passing the options per request.

```typescript
import {
  setDatabase,
  setToken,
  setProjectID,
  setTokenFromServiceAccount,
  setTokenFromEmailPassword,
} from "https://deno.land/x/dfirestore/mod.ts";

/*
 * CONFIGURATION: Add authentication token for all request. Use one of the `setToken` methods below
 */

// If GoogleService-Info.plist and gcloud installed on machine run to get service token
setTokenFromServiceAccount();
// If Email and Password secret shared. optional params if using env variables
setTokenFromEmailPassword(
  {
    email: "someemail@something.com",
    password: "something",
  },
  true // background refresh token before expiration
);
// Manually set authentication
setToken("FIREBASE_AUTHORIZATION_TOKEN");

// Optional: set db
setDatabase("(default)");
// Optional: set project id
setProjectID("myprojectid");
```

### Main

Use the REST client below via the following methods to perform CRUD operations.

```typescript
import { firestore } from "https://deno.land/dfirestore/mod.ts";

await firestore.createDocument({
  collection: "users",
  id: "L0xO1Yri80WlrFSw6KxqccHhKhv2",
  value: { firstname: { stringValue: "Jeff" } },
});
await firestore.getDocument({
  collection: "users",
  id: "L0xO1Yri80WlrFSw6KxqccHhKhv2",
});
await firestore.getDocumentList({
  collection: "users",
});
await firestore.getDocumentList({
  collection: "users",
  project: "somedprojectid",
});
await firestore.deleteDocument({
  collection: "users",
  id: "L0xO1Yri80WlrFSw6KxqccHhKhv2",
});
await firestore.updateDocument({
  collection: "users",
  id: "L0xO1Yri80WlrFSw6KxqccHhKhv2",
  value: { firstname: { stringValue: "Jeff" } },
});
```

## ENV variables

The env variables below will help setup the project defaults so you do not have to manually configure at the application level. If you are not going to setup any of the envs below you need to make sure you pass in the required params.

### Project

```
FIREBASE_DATABASE=(default)
FIREBASE_PROJECT_ID=
```

### IAM / admin auth / user

```
# the web api key
FIREBASE_PROJECT_KEY=
FIREBASE_AUTH_EMAIL=
FIREBASE_AUTH_PASSWORD=
```

### Explicite User Token

```
FIREBASE_TOKEN=
```

### CI

CI=false
