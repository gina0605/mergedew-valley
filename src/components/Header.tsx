import Image from "next/image";

export const Header = () => (
  <div className="w-full h-12 bg-slate-100 border-b border-slate-300 px-4 flex justify-center">
    <div className="w-full h-full max-w-4xl flex items-center justify-between space-x-2 ">
      <div className="w-24" />
      <div className="flex items-center space-x-2">
        <Image src="/assets/Junimo.png" alt="Junimo" width="32" height="32" />
        <h1>병합듀밸리</h1>
        <Image src="/assets/Junimo.png" alt="Junimo" width="32" height="32" />
      </div>
      <div className="w-24">
        <select className="border border-slate-300">
          <option>드래그 모드</option>
          <option>터치 모드</option>
        </select>
      </div>
    </div>
  </div>
);
