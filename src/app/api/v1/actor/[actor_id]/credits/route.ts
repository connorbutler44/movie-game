import { TMDBClient } from "@/service/tmdb";

interface RequestParams {
  actor_id?: number;
}

export async function GET(request: Request, { params }: NextApiRequestParams<RequestParams>) {
  if (!params.actor_id) {
    throw new Error("Missing actor_id");
  }

  const client = new TMDBClient(process.env.TMDB_API_KEY!);

  const credits = await client.person.credits(params.actor_id);

  return Response.json(credits);
}