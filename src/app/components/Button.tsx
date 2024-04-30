"use client";

interface Props {
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button: React.FC<Props> = (props) => {
  return (
    <button
      className="px-4 py-2 bg-blue-700 rounded"
      onClick={(e) => props.onClick?.(e)}
    >
      {props.children}
    </button>
  );
};

export default Button;
