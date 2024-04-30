import { MovieDetailsResponse } from "../service/tmdb/types";
import GameContainer from "./containers/GameContainer";
import { DailyPuzzle } from "@/types/puzzle";

export default async function Home() {
  const puzzle: DailyPuzzle = await fetch(
    `${process.env.APP_BASE_URL}/api/v1/puzzle/daily`,
    {
      cache: "no-store",
    }
  ).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch daily puzzle");
    }

    return res.json();
  });

  const startMovie: MovieDetailsResponse = await (
    await fetch(
      `${process.env.APP_BASE_URL}/api/v1/movie/${puzzle.start_movie_id}`
    )
  ).json();
  const endMovie: MovieDetailsResponse = await (
    await fetch(
      `${process.env.APP_BASE_URL}/api/v1/movie/${puzzle.end_movie_id}`
    )
  ).json();

  return (
    <main className="flex h-minus-navbar flex-col items-center px-6 py-6">
      <GameContainer
        puzzle={puzzle}
        startMovie={startMovie}
        endMovie={endMovie}
      />
    </main>
  );
}
