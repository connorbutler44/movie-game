"use client";

import { Entity } from "@/app/containers/GameContainer";
import { generateTmdbImageUrl } from "@/util/url";

interface Props {
  entity: Entity;
  onClick: () => void;
}

const EntityRow = (props: Props) => {
  return (
    <div
      className="w-full flex flex-row cursor-pointer p-2 rounded hover:bg-[#90A9B7] items-center text-xl bg-[#272727] mt-2 first:mt-0"
      onClick={() => props.onClick()}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          props.onClick();
        }
      }}
    >
      <img
        src={generateTmdbImageUrl(props.entity.thumbnailUrl).href}
        height={120}
        width={80}
        alt={props.entity.name}
      />
      <span className="px-6">{props.entity.name}</span>
    </div>
  );
};

export default EntityRow;
