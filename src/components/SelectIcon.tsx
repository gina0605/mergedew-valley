export interface SelectIcon {
  value: boolean;
  onClick: () => void;
}

export const SelectIcon = ({ value, onClick }: SelectIcon) => {
  const fillColor = value ? "#334155" : "#CBD5E1";
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      className="cursor-pointer"
    >
      <path
        d="M17.5 0H2.5C1.125 0 0 1.125 0 2.5V17.5C0 18.875 1.125 20 2.5 20H17.5C18.875 20 20 18.875 20 17.5V2.5C20 1.125 18.875 0 17.5 0ZM17.5 17.5H2.5V2.5H17.5V17.5Z"
        fill={fillColor}
      />
      <rect
        x="4.82758"
        y="4.82758"
        width="10.3448"
        height="10.3448"
        fill={fillColor}
      />
    </svg>
  );
};
