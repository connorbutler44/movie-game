import { TmdbApi } from "../api";

export interface MovieDetailsOptions {
}

export interface MovieCreditsOptions {
}

export interface MovieDetailsResponse {
  adult: boolean;
  backdrop_path: string;
  belongs_to_collection: any;
  budget: number;
  genres: { id: number; name: string }[];
  homepage: string;
  id: number;
  imdb_id: string;
  original_country: string[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: { id: number; logo_path: string; name: string; origin_country: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  release_date: string;
  revenue: number;
  runtime: number;
  spoken_languages: { english_name: string; iso_639_1: string; name: string }[];
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface MovieCreditsResponse {
  id: number;
  cast: MovieCredit[];
  crew: MovieCrew[];
}

export interface MovieCredit {
  adult: boolean;
  gender: 1 | 2;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}

export interface MovieCrew {
  adult: boolean;
  gender: 1 | 2;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string;
  credit_id: string;
  department: string;
  job: string;
}

export class MovieResource {
  protected api: TmdbApi;

  constructor(protected readonly apiKey: string) {
    this.api = new TmdbApi(apiKey);
  }

  async details(movie_id: number, options?: MovieDetailsOptions) {
    return this.api.get<MovieDetailsResponse>(`/movie/${movie_id}`, options);
  }

  async credits(movie_id: number, options?: MovieCreditsOptions) {
    return this.api.get<MovieCreditsResponse>(`/movie/${movie_id}/credits`, options);
  }
}