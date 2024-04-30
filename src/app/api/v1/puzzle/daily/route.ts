import { DailyPuzzle } from "@/types/puzzle";

export async function GET(request: Request) {
  const date = new Date();
  const formattedDate = date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  // TODO: pull from DB
  return Response.json({
    puzzle_id: crypto.randomUUID(),
    puzzle_date: formattedDate,
    // start_movie_id: 693134,
    // end_movie_id: 13151,
    start_movie_id: 293660,
    end_movie_id: 680,
  } satisfies DailyPuzzle);
}