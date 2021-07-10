export interface TransactionOptions {
  readOnly?: {
    readTime: string;
  };
  readWrite?: {
    retryTransaction: string;
  };
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

export type ArrayValue = {
  values: Partial<Value>[];
};

export type MapValue = {
  fields: {
    [key: string]: Partial<Value>;
  };
};

export type Value = {
  nullValue: null;
  booleanValue: boolean;
  integerValue: string;
  doubleValue: number;
  timestampValue: string | Date;
  stringValue: string;
  bytesValue: string;
  referenceValue: string;
  geoPointValue: LatLng;
  arrayValue: ArrayValue;
  mapValue: MapValue;
};

export enum ServerValue {
  SERVER_VALUE_UNSPECIFIED,
  REQUEST_TIME,
}

export type FieldTransform = {
  fieldPath?: string;
  setToServerValue?: ServerValue;
  increment?: Value;
  maximum?: Value;
  minimum?: Value;
  appendMissingElements?: ArrayValue;
  removeAllFromArray?: ArrayValue;
};

export type Precondition = {
  exists: boolean;
  updateTime: string;
};

export interface Document {
  name: string;
  fields: {
    [key: string]: Partial<Value>;
  };
  createTime: string;
  updateTime: string;
}

export interface DocumentTransform {
  document: string;
  fieldTransforms: FieldTransform[];
}

export interface Write {
  updateMask: {
    fieldPaths: string[];
  };
  updateTransforms: FieldTransform[];
  currentDocument: Precondition;
  update: Document;
  delete: string;
  transform: DocumentTransform;
}

export interface FireRequest {
  collection?: string;
  id?: string;
  value?: {
    [key: string]: Partial<Value>;
  };
}

export interface FetchRequest extends Partial<Request> {
  url: string;
  database?: string;
  authorization?: string | boolean;
  reqBody?: Record<string, unknown>;
  project?: string;
  pageSize?: number;
  pageToken?: string;
  orderBy?: string;
  showMissing?: boolean;
  mask?: {
    fieldPaths: string[];
  };
  transaction?: string;
  options?: TransactionOptions;
  writes?: Write[];
}

export type FireError = {
  code: number;
  status: string;
};

export interface FireResponse {
  documents: Document[];
  fields: MapValue["fields"];
  error?: FireError;
  id?: string;
}

export interface RequestInterface extends FireRequest, Partial<FetchRequest> {}

export type FireMethods =
  | "createDocument"
  | "rollback"
  | "updateDocument"
  | "moveDocuments"
  | "getDocument"
  | "commitTransaction"
  | "deleteDocument"
  | "beginTransaction";

export interface FireEvents {
  log: Exclude<Partial<FetchRequest>, "outputUriPrefix">;
  event: FireMethods;
}

export type GetDocument = Pick<
  RequestInterface,
  | "authorization"
  | "collection"
  | "id"
  | "project"
  | "value"
  | "showMissing"
  | "mask"
  | "pageSize"
  | "pageToken"
  | "orderBy"
>;

export type DeleteDocument = Pick<
  RequestInterface,
  "authorization" | "collection" | "id" | "project"
>;

export type CreateDocument = Partial<
  Pick<
    RequestInterface,
    "authorization" | "collection" | "id" | "project" | "value"
  >
>;

export type UpdateDocument = Pick<
  RequestInterface,
  "authorization" | "collection" | "id" | "value" | "project"
>;

export type BeginTransaction = Pick<
  RequestInterface,
  "authorization" | "options" | "project"
>;

export type CommitTransaction = Pick<
  RequestInterface,
  "authorization" | "options" | "project" | "writes" | "transaction"
>;

export type ImportExport = {
  /* Which collection ids to export. Unspecified means all collections. */
  collectionIds?: string[];
  /*
   * The output URI. Currently only supports Google Cloud Storage URIs of the
   * form: gs://BUCKET_NAME[/NAMESPACE_PATH], where BUCKET_NAME is the name of the
   * Google Cloud Storage bucket and NAMESPACE_PATH
   * is an optional Google Cloud Storage namespace path.
   */
  outputUriPrefix?: string;
};

export type MoveDocuments = Pick<RequestInterface, "authorization"> &
  ImportExport & {
    project?: RequestInterface["project"];
    type?: "import" | "export";
  };

export interface RollBack {
  transaction?: string;
  authorization?: RequestInterface["authorization"];
}

export type ListParams = {
  size?: string;
  page?: string;
  order?: string;
  fields?: string;
  missing?: string;
};

export type Arguements =
  | BeginTransaction
  | RollBack
  | MoveDocuments
  | ImportExport
  | CommitTransaction
  | BeginTransaction
  | UpdateDocument
  | CreateDocument
  | DeleteDocument
  | GetDocument;
