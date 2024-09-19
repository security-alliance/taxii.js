import { TaxiiError } from "../types.js";
import { StixObject } from "@security-alliance/stix/src/2.1/types.js";
import {
  TaxiiClientOptions,
  DiscoveryResource,
  ApiRootResource,
  CollectionsResource,
  GetObjectsOptions,
  EnvelopeResource,
} from "./types.js";

export class TaxiiClient {
  opts: TaxiiClientOptions;

  constructor(opts: TaxiiClientOptions) {
    this.opts = opts;
    if (this.opts.endpoint.endsWith("/")) {
      this.opts.endpoint = this.opts.endpoint.substring(
        0,
        this.opts.endpoint.length - 1,
      );
    }
  }

  private async fetch<T>(
    method: "GET" | "POST",
    path: string,
    body?: any,
  ): Promise<T> {
    const response = await fetch(`${this.opts.endpoint}${path}`, {
      method: method,
      body: body,
      headers: this.opts.authorization
        ? {
            Accept: "application/taxii+json;version=2.1",
            Authorization: `Bearer ${this.opts.authorization}`,
          }
        : {
            Accept: "application/taxii+json;version=2.1",
          },
    });

    if (response.status !== 200) {
      const body = await response.json();

      throw new TaxiiError(body["title"] || JSON.stringify(body));
    }

    return await response.json();
  }

  public async getDiscovery(): Promise<DiscoveryResource> {
    return await this.fetch("GET", `/`);
  }

  public async getApiRoot(apiRoot: string): Promise<ApiRootResource> {
    return await this.fetch("GET", `/${this.transformApiRoot(apiRoot)}`);
  }

  public async getCollections(apiRoot: string): Promise<CollectionsResource> {
    return await this.fetch(
      "GET",
      `/${this.transformApiRoot(apiRoot)}/collections`,
    );
  }

  public async getObjects<T extends StixObject>(
    apiRoot: string,
    collectionId: string,
    options?: GetObjectsOptions,
  ): Promise<EnvelopeResource<T>> {
    const search = new URLSearchParams();
    if (options?.addedAfter !== undefined)
      search.set("added_after", options.addedAfter.toISOString());
    if (options?.limit !== undefined)
      search.set("limit", options.limit.toString());
    if (options?.next !== undefined) search.set("next", options.next);
    if (options?.id !== undefined) search.set("match[id]", options.id);
    if (options?.type !== undefined) search.set("match[type]", options.type);
    if (options?.version !== undefined)
      search.set("match[version]", options.version);
    if (options?.spec_version !== undefined)
      search.set("match[spec_version]", options.spec_version);

    return await this.fetch(
      "GET",
      `/${this.transformApiRoot(apiRoot)}/collections/${collectionId}/objects?${search.toString()}`,
    );
  }

  public async getAllObjects<T extends StixObject>(
    apiRoot: string,
    collectionId: string,
    options?: Omit<GetObjectsOptions, "next">,
  ): Promise<T[]> {
    const results: T[] = [];

    let next: string | undefined = undefined;
    while (true) {
      const response: EnvelopeResource<T> = await this.getObjects<T>(
        apiRoot,
        collectionId,
        {
          ...options,
          next: next,
        },
      );

      results.push(...response.objects);

      if (!response.more) break;

      next = response.next;
    }

    return results;
  }

  private transformApiRoot(url: string): string {
    if (url.startsWith(this.opts.endpoint + "/")) {
      return url.substring(this.opts.endpoint.length + 1);
    }

    return url;
  }
}
