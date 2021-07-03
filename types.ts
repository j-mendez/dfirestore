interface TransactionOptions {
  readOnly: {
    readTime: string;
  };
  readWrite: {
    retryTransaction: string;
  };
}

interface LatLng {
  latitude: number;
  longitude: number;
}

export interface ArrayValue {
  values: Value[];
}

export interface MapValue {
  fields: {
    [key: string]: Value;
  };
}

export interface Value {
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
}

export enum ServerValue {
  SERVER_VALUE_UNSPECIFIED,
  REQUEST_TIME,
}

export interface FieldTransform {
  fieldPath?: string;
  setToServerValue?: ServerValue;
  increment?: Value;
  maximum?: Value;
  minimum?: Value;
  appendMissingElements?: ArrayValue;
  removeAllFromArray?: ArrayValue;
}

export interface Precondition {
  exists: boolean;
  updateTime: string;
}

export interface Document {
  name: string;
  fields: {
    [key: string]: Value;
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
  reqBody?: object;
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

export interface RequestInterface extends FireRequest, Partial<FetchRequest> {}

export interface FireEvents {
  log: RequestInterface & { res: object | undefined };
}
