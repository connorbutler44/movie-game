import { forwardRef } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const Filter = forwardRef<HTMLInputElement, Props>(function Filter(
  props: Props,
  ref
) {
  return (
    <input
      ref={ref}
      className="bg-[#272727] text-white p-2 rounded w-full my-2 text-xl"
      value={props.value}
      onChange={(e) => props.onChange(e.currentTarget.value)}
      placeholder="Filter"
      autoFocus
    />
  );
});

export default Filter;
