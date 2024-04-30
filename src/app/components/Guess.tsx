import { Entity } from "@/app/containers/GameContainer";
import { generateTmdbImageUrl } from "@/util/url";

interface Props {
  guess: Entity;
  isLast: boolean;
}

const Guess = (props: Props) => {
  const { guess, isLast } = props;

  return (
    <div key={guess.id} className="flex flex-row items-center mt-1">
      <img
        src={generateTmdbImageUrl(guess.thumbnailUrl).href}
        width={40}
        alt={guess.name}
        title={guess.name}
      />
      {isLast && <span className="ml-2">{guess.name}</span>}
      <span className="mx-2">→</span>
    </div>
  );
};

export default Guess;
