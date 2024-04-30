import { TmdbApi } from "../api";

export interface PeopleSearchOptions {
  query: string;
}

export class SearchResource {
  protected api: TmdbApi;

  constructor(protected readonly apiKey: string) {
    this.api = new TmdbApi(apiKey);
  }

  async people(options: PeopleSearchOptions) {
    return this.api.get(`/search/person`, options);
  }
}