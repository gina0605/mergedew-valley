import Image from "next/image";

export const Header = () => (
  <div className="w-full h-12 bg-slate-100 border-b border-slate-300 px-4 flex justify-center items-center space-x-2">
    <Image src="/assets/Junimo.png" alt="Junimo" width="32" height="32" />
    <h1>병합듀밸리</h1>
    <Image src="/assets/Junimo.png" alt="Junimo" width="32" height="32" />
  </div>
);
