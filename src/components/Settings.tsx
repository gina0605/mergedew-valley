import Image from "next/image";
import { useState } from "react";

export interface SettingsProps {
  zoom: number;
  mode: string;
  xOffset: number;
  yOffset: number;
  setZoom: (x: number) => void;
  setMode: (x: string) => void;
  setGuide: (x: string) => void;
  setXOffset: (x: number) => void;
  setYOffset: (x: number) => void;
}

export const Settings = ({
  zoom,
  mode,
  xOffset,
  yOffset,
  setZoom,
  setMode,
  setGuide,
  setXOffset,
  setYOffset,
}: SettingsProps) => {
  const [guideUrl, setGuideUrl] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center border border-slate-300 p-2 mt-2 space-y-2">
      <div className="flex space-x-4 items-center">
        <div className="w-24">
          <select
            className="border border-slate-300 w-24"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="drag">드래그 모드</option>
            <option value="touch">터치 모드</option>
          </select>
        </div>
        <div className="flex space-x-2 items-center">
          <p className="align-middle h-6 leading-6 font-pretendard">확대</p>
          <input
            type="range"
            min="1"
            max="20"
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value))}
          />
          <input
            type="number"
            min="1"
            max="20"
            className="border border-slate-300 pl-1"
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value))}
          />
        </div>
      </div>
      <div className="flex justify-center space-x-4">
        <div className="flex space-x-1">
          <p className="align-middle h-6 leading-6 font-pretendard">x 오프셋</p>
          <input
            type="number"
            className="w-12 border border-slate-300 pl-1"
            value={xOffset}
            onChange={(e) => setXOffset(parseInt(e.target.value))}
          />
        </div>
        <div className="flex space-x-1">
          <p className="align-middle h-6 leading-6 font-pretendard">y 오프셋</p>
          <input
            type="number"
            className="w-12 border border-slate-300 pl-1"
            value={yOffset}
            onChange={(e) => setYOffset(parseInt(e.target.value))}
          />
        </div>
      </div>
      <div className="flex space-x-2">
        <p className="font-pretendard">가이드라인</p>
        <input
          type="file"
          className="w-48 md:w-96 font-pretendard text-sm truncate"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.length !== 1) return;
            if (guideUrl) URL.revokeObjectURL(guideUrl);
            const url = URL.createObjectURL(e.target.files[0]);
            setGuideUrl(url);
            setGuide(url);
          }}
        />
      </div>
    </div>
  );
};
