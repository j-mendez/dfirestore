export interface TransactionOptions {
  readOnly: {
    readTime: string;
  };
  readWrite: {
    retryTransaction: string;
  };
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

export type ArrayValue = {
  values: Value[];
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
}

export interface RequestInterface extends FireRequest, Partial<FetchRequest> {}

export interface FireEvents {
  log: RequestInterface & { res?: FireResponse };
}
