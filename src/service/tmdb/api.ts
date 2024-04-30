export class TmdbApi {
  baseUrl: string = "https://api.themoviedb.org/3";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async get<T>(path: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    url.search = new URLSearchParams(params).toString();

    const response = await fetch(url, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      return Promise.reject(response.statusText);
    }

    return await response.json() as T;
  }
}