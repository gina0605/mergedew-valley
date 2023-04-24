export interface ButtonProps {
  text: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const Button = ({ text, disabled, onClick }: ButtonProps) => (
  <button
    className={`${
      disabled
        ? "bg-slate-50 border-slate-400"
        : "bg-green-100 hover:bg-green-200 border-emerald-500"
    } rounded-lg p-2 border ease-in duration-100`}
    disabled={disabled}
    onClick={onClick}
  >
    <p className="font-omyu text-xl leading-none">{text}</p>
  </button>
);
