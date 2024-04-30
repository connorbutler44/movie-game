import { TMDBClient } from "@/service/tmdb";

interface RequestParams {
  movie_id?: number;
}

export async function GET(request: Request, { params }: NextApiRequestParams<RequestParams>) {
  if (!params.movie_id) {
    throw new Error("Missing movie_id");
  }

  const client = new TMDBClient(process.env.TMDB_API_KEY!);

  const credits = await client.movie.details(params.movie_id);

  return Response.json(credits)
}