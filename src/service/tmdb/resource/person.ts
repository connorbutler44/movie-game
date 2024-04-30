import { TmdbApi } from "../api";

export interface PersonDetailsOptions {
}

export interface PersonCreditsOptions {
}

export class PersonResource {
  protected api: TmdbApi;

  constructor(protected readonly apiKey: string) {
    this.api = new TmdbApi(apiKey);
  }

  async details(person_id: number, options?: PersonDetailsOptions) {
    return this.api.get(`/person/${person_id}`, options);
  }

  async credits(person_id: number, options?: PersonDetailsOptions) {
    return this.api.get(`/person/${person_id}/movie_credits`, options);
  }
}