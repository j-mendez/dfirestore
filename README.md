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

// set db
setDatabase("(default)");
// set project
setProjectID("myprojectid");
```

### Main

Use the REST client below via the following methods to perform CRUD operations.

```typescript
import { firestore } from "https://deno.land/dfirestore/mod.ts";

await firestore.getDocument({
  collection: "mycollection",
  id: "collection id",
});
await firestore.getDocumentList("document");
await firestore.deleteDocument("document/id");
await firestore.updateDocument("document/id");
```

## ENV variables

If you have a .env file the below env variables will be picked up. If you not you need to make sure you pass in the required params.

### Project

```
FIREBASE_DATABASE=
FIREBASE_PROJECT_ID=
```

### IAM admin auth - via email, password

```
FIREBASE_PROJECT_KEY=
FIREBASE_AUTH_EMAIL=
FIREBASE_AUTH_PASSWORD=
```

### Explicite authenticated user

```
FIREBASE_TOKEN=
```

### CI

CI=false
