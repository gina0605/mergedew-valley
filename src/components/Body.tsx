import Image from "next/image";
import { Settings } from "./Settings";
import { Canvas } from "./Canvas";

export const Body = () => (
  <div className="flex flex-col items-center space-y-2">
    <Settings />
    <div className="flex space-x-4">
      <button className="bg-green-100 rounded-lg p-2 border border-emerald-500">
        <p className="font-omyu text-xl leading-none">이어서 병합</p>
      </button>
      <button className="bg-green-100 rounded-lg p-2 border border-emerald-500">
        <p className="font-omyu text-xl leading-none">png 다운로드</p>
      </button>
      <button className="bg-green-100 rounded-lg p-2 border border-emerald-500">
        <p className="font-omyu text-xl leading-none">xnb 다운로드</p>
      </button>
    </div>
    <div className="flex space-x-6 pt-2">
      <Canvas title="병합용 파일" />
      <Canvas title="원본 파일" />
    </div>
  </div>
);
