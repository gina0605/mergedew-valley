import { betterParseInt } from "@/utils";
import { NumberInput } from "./NumberInput";
import { unpack } from "../unpack";
import { useEffect, useState } from "react";

export interface ScaleSettingsProps {
  setScale: (x: number) => void;
}

const ScaleSettings = ({ setScale }: ScaleSettingsProps) => {
  const [scaleOpt, setScaleOpt] = useState("ori");
  const [decScale, setDecScale] = useState(2);
  const [incScale, setIncScale] = useState(2);

  useEffect(
    () =>
      setScale(
        scaleOpt === "ori" ? 1 : scaleOpt === "dec" ? 1 / decScale : incScale
      ),
    [scaleOpt, decScale, incScale]
  );

  return (
    <div className="flex space-x-4 w-full items-center">
      <p className="h-6 leading-6 font-pretendard shrink-0">
        다운로드 시 파일 배율
      </p>
      <div className="flex flex-col space-y-1 md:flex-row md:space-x-2 md:space-y-0">
        <select
          value={scaleOpt}
          onChange={(e) => setScaleOpt(e.target.value)}
          className="w-16 border border-slate-300"
        >
          <option value="dec">축소</option>
          <option value="ori">원본</option>
          <option value="inc">확대</option>
        </select>
        <div className={`flex space-x-1 ${scaleOpt === "ori" ? "hidden" : ""}`}>
          <NumberInput
            className="border border-slate-300 pl-1 w-12"
            min="1"
            value={scaleOpt === "dec" ? decScale : incScale}
            onChange={scaleOpt === "dec" ? setDecScale : setIncScale}
          />
          <p>배</p>
        </div>
      </div>
    </div>
  );
};

export interface SettingsProps {
  zoom: number;
  xOffset: number;
  yOffset: number;
  setZoom: (x: number) => void;
  setGuide: (x: string) => void;
  setXOffset: (x: number) => void;
  setYOffset: (x: number) => void;
  setScale: (x: number) => void;
}

export const Settings = ({
  zoom,
  xOffset,
  yOffset,
  setZoom,
  setGuide,
  setXOffset,
  setYOffset,
  setScale,
}: SettingsProps) => {
  return (
    <div className="flex flex-col items-center border border-slate-300 p-2 mt-2 space-y-3 w-96 max-w-[90vw] md:px-4">
      <div className="flex space-x-2 w-full">
        <p className="font-pretendard shrink-0">가이드라인</p>
        <input
          type="file"
          className="w-48 grow font-pretendard text-sm truncate"
          accept="image/*,.xnb"
          onChange={async (e) => {
            if (e.target.files?.length !== 1) return;
            const file = e.target.files[0];
            try {
              setGuide(
                URL.createObjectURL(file.type ? file : await unpack(file))
              );
            } catch (e) {
              alert("파일 읽기에 실패했습니다.");
            }
          }}
        />
      </div>
      <ScaleSettings setScale={setScale} />
      <div className="flex space-x-4 items-center w-full">
        <p className="align-middle h-6 leading-6 font-pretendard shrink-0">
          확대
        </p>
        <input
          type="range"
          min="1"
          max="25"
          className="grow"
          value={zoom}
          onChange={(e) => setZoom(betterParseInt(e.target.value))}
        />
        <NumberInput
          className="border border-slate-300 pl-1"
          min="1"
          max="25"
          value={zoom}
          onChange={setZoom}
        />
      </div>
      <div className="flex justify-center space-x-1 md:space-x-4">
        <p className="align-middle h-6 leading-6 font-pretendard shrink-0">
          x 오프셋
        </p>
        <NumberInput
          className="w-16 border border-slate-300 pl-1"
          value={xOffset}
          onChange={setXOffset}
        />
        <div className="w-1" />
        <p className="align-middle h-6 leading-6 font-pretendard shrink-0">
          y 오프셋
        </p>
        <NumberInput
          className="w-16 border border-slate-300 pl-1"
          value={yOffset}
          onChange={setYOffset}
        />
      </div>
    </div>
  );
};
