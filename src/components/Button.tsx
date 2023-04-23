export interface ButtonProps {
  text: string;
}

export const Button = ({ text }: ButtonProps) => (
  <button className="bg-green-100 rounded-lg p-2 border border-emerald-500 hover:bg-green-200 ease-in duration-100">
    <p className="font-omyu text-xl leading-none">{text}</p>
  </button>
);
