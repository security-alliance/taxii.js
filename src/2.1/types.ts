import { StixObject } from "@security-alliance/stix/2.1";

export type TaxiiClientOptions = {
  endpoint: string;

  authorization?: string;
};

export type DiscoveryResource = {
  title: string;
  description?: string;
  contact?: string;
  default?: string;
  api_roots?: string[];
};

export type ApiRootResource = {
  title: string;
  description?: string;
  versions: string[];
  max_content_length: number;
};

export type CollectionsResource = {
  collections?: CollectionResource[];
};

export type CollectionResource = {
  id: string;
  title: string;
  description?: string;
  alias?: string;
  can_read: boolean;
  can_write: boolean;
  media_types?: string[];
};

export type GetObjectsOptions = {
  addedAfter?: Date;
  limit?: number;
  next?: string;
  id?: string;
  type?: string;
  version?: string;
  spec_version?: string;
};

export type EnvelopeResource<T extends StixObject> = {
  more: boolean;
  next: string;
  objects: T[];
};

export type Identifier = string;
