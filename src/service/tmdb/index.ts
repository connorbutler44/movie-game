import { MovieResource } from "./resource/movie";
import { PersonResource } from "./resource/person";
import { SearchResource } from "./resource/search";

export class TMDBClient {
  constructor(protected readonly apiKey: string) {
    this.apiKey = apiKey;
  }

  get search() {
    return new SearchResource(this.apiKey);
  }

  get person() {
    return new PersonResource(this.apiKey);
  }

  get movie() {
    return new MovieResource(this.apiKey);
  }
}