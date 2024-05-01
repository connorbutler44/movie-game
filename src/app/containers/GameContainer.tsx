"use client";

import Button from "@/app/components/Button";
import EntityRow from "@/app/components/EntityRow";
import Filter from "@/app/components/Filter";
import Guess from "@/app/components/Guess";
import { MovieDetailsResponse } from "@/service/tmdb/types";
import { DailyPuzzle } from "@/types/puzzle";
import { formatTime, isFutureDate } from "@/util/date";
import { generateTmdbImageUrl } from "@/util/url";
import Image from "next/image";
import { Fragment, useEffect, useReducer, useRef, useState } from "react";

export interface Entity {
  type: "ACTOR" | "MOVIE";
  id: number;
  name: string;
  thumbnailUrl: string;
  popularity: number;
}

interface ActiveState {
  gameState: "ACTIVE" | "COMPLETE";
  startMovieId: number;
  endMovieId: number;
  guesses: Entity[];
  activeEntity: { id: number; type: "MOVIE" | "ACTOR" };
  activeEntityCreditsLoading: boolean;
  activeEntityCredits: Entity[];
}

interface InactiveState {
  gameState: "INACTIVE" | "ERROR";
}

type State = ActiveState | InactiveState;

interface StartGameAction {
  type: "START_GAME";
  startMovieId: number;
  endMovieId: number;
}

interface LoadEntityCreditsAction {
  type: "LOAD_ENTITY_CREDITS";
}

interface LoadEntityCreditsCompleteAction {
  type: "LOAD_ENTITY_CREDITS_COMPLETE";
  entityCredits: Entity[];
}

interface GuessAction {
  type: "GUESS";
  entity: Entity;
}

interface ErrorAction {
  type: "ERROR";
}

type GameStateAction =
  | StartGameAction
  | LoadEntityCreditsAction
  | LoadEntityCreditsCompleteAction
  | GuessAction
  | ErrorAction;

function reducer(state: State, action: GameStateAction): State {
  switch (action.type) {
    case "START_GAME":
      return {
        ...state,
        gameState: "ACTIVE",
        startMovieId: action.startMovieId,
        endMovieId: action.endMovieId,
        activeEntity: { id: action.startMovieId, type: "MOVIE" },
        guesses: [],
        activeEntityCredits: [],
        activeEntityCreditsLoading: true,
      };
    case "LOAD_ENTITY_CREDITS":
      if (state.gameState !== "ACTIVE" && state.gameState !== "COMPLETE") {
        throw new Error("Invalid state");
      }

      return { ...state, activeEntityCreditsLoading: true };
    case "LOAD_ENTITY_CREDITS_COMPLETE":
      if (state.gameState !== "ACTIVE" && state.gameState !== "COMPLETE") {
        throw new Error("Invalid state");
      }

      return {
        ...state,
        activeEntityCredits: action.entityCredits,
        activeEntityCreditsLoading: false,
      };
    case "GUESS":
      if (state.gameState !== "ACTIVE" && state.gameState !== "COMPLETE") {
        throw new Error("Invalid state");
      }

      if (
        action.entity.type === "MOVIE" &&
        action.entity.id === state.endMovieId
      ) {
        // game complete
        return {
          ...state,
          gameState: "COMPLETE",
        };
      }

      const entity = state.activeEntityCredits.find(
        (entity) => entity.id === action.entity.id
      );

      if (!entity) {
        throw new Error("Entity not found");
      }

      const guesses = [...state.guesses, entity];

      return {
        ...state,
        guesses,
        activeEntityCredits: [],
        activeEntityCreditsLoading: true,
        activeEntity: {
          id: action.entity.id,
          type: entity.type,
        },
      };
    case "ERROR":
      return { gameState: "ERROR" };
    default:
      return state;
  }
}

interface Props {
  puzzle: DailyPuzzle;
  startMovie: MovieDetailsResponse;
  endMovie: MovieDetailsResponse;
}

const GameContainer = (props: Props) => {
  const [state, dispatch] = useReducer(reducer, { gameState: "INACTIVE" });
  const [filterValue, setFilterValue] = useState("");
  const filterRef = useRef<HTMLInputElement>(null);
  const timerId = useRef<NodeJS.Timeout | null>(null);
  const [timerDisplay, setTimerDisplay] = useState(0);

  useEffect(() => {
    if (state.gameState === "ACTIVE") {
      setTimerDisplay(0);
      timerId.current = setInterval(() => {
        setTimerDisplay((curr) => curr + 1);
      }, 1000);
    } else if (timerId.current) {
      clearInterval(timerId.current);
    }

    return () => {
      if (timerId.current) {
        clearInterval(timerId.current);
      }
    };
  }, [state.gameState, setTimerDisplay]);

  const onStartGameClick = () => {
    dispatch({
      type: "START_GAME",
      startMovieId: props.startMovie.id,
      endMovieId: props.endMovie.id,
    });
  };

  const onEntityClick = (entity: Entity) => {
    dispatch({ type: "GUESS", entity });
    setFilterValue("");
    filterRef.current?.focus();
  };

  const activeEntity =
    state.gameState === "ACTIVE" || state.gameState === "COMPLETE"
      ? state.activeEntity
      : null;

  useEffect(() => {
    if (activeEntity) {
      dispatch({ type: "LOAD_ENTITY_CREDITS" });

      if (activeEntity.type === "MOVIE") {
        fetch(
          `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/v1/movie/${activeEntity.id}/credits`
        )
          .then((res) => {
            if (!res.ok) {
              throw new Error("Failed to fetch credits");
            }

            return res.json();
          })
          .then((response) => {
            const entityCredits = response.cast
              .sort((a: any, b: any) => a.order - b.order)
              .map((credit: any) => {
                return {
                  id: credit.id,
                  name: credit.name,
                  thumbnailUrl: credit.profile_path,
                  type: "ACTOR",
                  popularity: credit.popularity,
                } satisfies Entity;
              });
            dispatch({ type: "LOAD_ENTITY_CREDITS_COMPLETE", entityCredits });
          })
          .catch(() => {
            dispatch({ type: "ERROR" });
          });
      } else {
        fetch(
          `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/v1/actor/${activeEntity.id}/credits`
        )
          .then((res) => {
            if (!res.ok) {
              throw new Error("Failed to fetch credits");
            }

            return res.json();
          })
          .then((response: any) => {
            const entityCredits = response.cast
              .map((movie: any) => ({
                ...movie,
                _date:
                  movie.release_date !== ""
                    ? new Date(movie.release_date)
                    : undefined,
              }))
              .filter((movie: any) => movie._date && !isFutureDate(movie._date))
              .map((movie: any) => {
                const year = Number(movie.release_date.split("-")[0]);

                return {
                  id: movie.id,
                  name: `${movie.title} (${year})`,
                  thumbnailUrl: movie.poster_path,
                  type: "MOVIE",
                  popularity: movie.popularity,
                  _date: movie._date,
                };
              })
              .sort((a: any, b: any) => b._date - a._date);
            dispatch({ type: "LOAD_ENTITY_CREDITS_COMPLETE", entityCredits });
          })
          .catch(() => {
            dispatch({ type: "ERROR" });
          });
      }
    }
  }, [activeEntity, state.gameState]);

  const displayGuesses: Entity[] = [
    {
      id: props.startMovie.id,
      name: props.startMovie.title,
      thumbnailUrl: props.startMovie.poster_path,
      type: "MOVIE",
      popularity: 0,
    },
    ...(state.gameState === "ACTIVE" ? state.guesses : []),
  ];

  const totalPopularity =
    state.gameState === "ACTIVE" || state.gameState === "COMPLETE"
      ? state.guesses.reduce((acc, guess) => acc + guess.popularity, 0)
      : 0;

  return (
    <Fragment>
      {state.gameState === "INACTIVE" && (
        <div className="flex flex-col">
          <div className="py-4">
            <h1 className="text-center">
              Daily movie guessing game
              <br />
              Can you get from one movie to another with the most obscure
              connections?
            </h1>
          </div>
          <div className="mt-4 grid grid-cols-[4fr_1fr_4fr]">
            <Image
              className="rounded"
              src={generateTmdbImageUrl(props.startMovie.poster_path).href}
              height={600}
              width={400}
              alt={props.startMovie.title}
              title={props.startMovie.title}
            />
            <div className="px-6 self-center justify-self-center">→</div>
            <Image
              className="rounded"
              src={generateTmdbImageUrl(props.endMovie.poster_path).href}
              height={600}
              width={400}
              alt={props.endMovie.title}
              title={props.endMovie.title}
            />
          </div>
          <div className="items-center mt-20 flex justify-center">
            <Button onClick={onStartGameClick}>Start Game</Button>
          </div>
        </div>
      )}
      {state.gameState === "ACTIVE" && (
        <div className="flex flex-col overflow-auto w-full max-w-3xl p-2">
          <div className="self-center">{formatTime(timerDisplay)}</div>
          <div className="flex items-center justify-between">
            <div className="flex flex-row items-center">
              <img
                src={generateTmdbImageUrl(props.startMovie.poster_path).href}
                width={40}
                alt={props.startMovie.title}
                title={props.startMovie.title}
              />
              <span className="ml-2">{props.startMovie.title}</span>
            </div>
            <div>→</div>
            <div className="flex flex-row items-center">
              <img
                src={generateTmdbImageUrl(props.endMovie.poster_path).href}
                width={40}
                alt={props.endMovie.title}
                title={props.endMovie.title}
              />
              <span className="ml-2">{props.endMovie.title}</span>
            </div>
          </div>
          <div className="flex flex-row mt-4 flex-wrap">
            {displayGuesses.map((guess, index) => (
              <Guess
                key={guess.id}
                guess={guess}
                isLast={index === displayGuesses.length - 1}
              />
            ))}
          </div>
          <Filter
            ref={filterRef}
            onChange={setFilterValue}
            value={filterValue}
          />
          {state.activeEntityCreditsLoading ? (
            <div>Loading Credits...</div>
          ) : (
            <div className="overflow-auto flex flex-col p-1 ">
              {state.activeEntityCredits
                .filter((entity) =>
                  entity.name.toLowerCase().includes(filterValue.toLowerCase())
                )
                .map((entity) => (
                  <EntityRow
                    entity={entity}
                    key={entity.id}
                    onClick={() => onEntityClick(entity)}
                  />
                ))}
            </div>
          )}
        </div>
      )}
      {state.gameState === "COMPLETE" && (
        <div className="flex flex-col overflow-auto w-full max-w-3xl p-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-row items-center">
              <img
                src={generateTmdbImageUrl(props.startMovie.poster_path).href}
                width={40}
                alt={props.startMovie.title}
                title={props.startMovie.title}
              />
              <span className="ml-2">{props.startMovie.title}</span>
            </div>
            <div>→</div>
            <div className="flex flex-row items-center">
              <img
                src={generateTmdbImageUrl(props.endMovie.poster_path).href}
                width={40}
                alt={props.endMovie.title}
                title={props.endMovie.title}
              />
              <span className="ml-2">{props.endMovie.title}</span>
            </div>
          </div>
          <div className="flex mt-6">
            <div className="rounded bg-[#272727] grow mr-2 px-4 py-8 flex align-center justify-center items-center flex-col">
              <div className="text-sm">Time</div>
              <div>{formatTime(timerDisplay)}</div>
            </div>
            <div className="rounded bg-[#272727] grow mr-2 px-4 py-8 flex align-center justify-center items-center flex-col">
              <div className="text-sm">Score (lower is better)</div>
              <div>{Math.round(totalPopularity)}</div>
            </div>
          </div>

          <div className="flex flex-col mt-6 overflow-auto">
            <div className="flex flex-row items-center py-2 text-xl">
              <img
                src={generateTmdbImageUrl(props.startMovie.poster_path).href}
                height={120}
                width={80}
                alt={props.startMovie.title}
              />
              <span className="px-6">{props.startMovie.title}</span>
            </div>
            <div className="ml-[30px]">↓</div>
            {state.guesses.map((guess) => {
              return (
                <Fragment key={guess.id}>
                  <div className="flex flex-row items-center py-2 text-xl">
                    <img
                      src={generateTmdbImageUrl(guess.thumbnailUrl).href}
                      height={120}
                      width={80}
                      alt={guess.name}
                    />
                    <span className="px-6">{guess.name}</span>
                  </div>
                  <div className="ml-[30px]">↓</div>
                </Fragment>
              );
            })}
            <div className="flex flex-row items-center py-2 text-xl">
              <img
                src={generateTmdbImageUrl(props.endMovie.poster_path).href}
                height={120}
                width={80}
                alt={props.endMovie.title}
              />
              <span className="px-6">{props.endMovie.title}</span>
            </div>
          </div>
        </div>
      )}
      {state.gameState === "ERROR" && <div>Error</div>}
    </Fragment>
  );
};

export default GameContainer;
