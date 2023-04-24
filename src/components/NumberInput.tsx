import { betterParseInt } from "@/utils";
import { useEffect, useState } from "react";

export interface NumberInputProps {
  className: string;
  min?: string;
  max?: string;
  value: number;
  onChange: (v: number) => void;
}

export const NumberInput = ({
  className,
  min,
  max,
  value,
  onChange,
}: NumberInputProps) => {
  const [v, setV] = useState(`${value}`);

  useEffect(() => {
    if (value !== 0 || v !== "") setV(`${value}`);
  }, [value]);

  return (
    <input
      type="number"
      className={className}
      value={v}
      min={min}
      max={max}
      onChange={(e) => {
        setV(e.target.value);
        const x = betterParseInt(e.target.value);
        if (
          (min === undefined || x >= parseInt(min)) &&
          (max === undefined || x <= parseInt(max))
        )
          onChange(x);
      }}
      onBlur={() => setV(`${value}`)}
    />
  );
};
