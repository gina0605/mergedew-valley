import { Settings } from "./Settings";
import { Canvas } from "./Canvas";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import { array2d } from "@/utils";

export const Body = () => {
  const [zoom, setZoom] = useState(1);
  const [mode, setMode] = useState("drag");
  const [guide, setGuide] = useState<string | null>(null);
  const [mergeName, setMergeName] = useState("");
  const [mergeData, setMergeData] = useState<ImageData | null>(null);
  const [originalName, setOriginalName] = useState("");
  const [originalData, setOriginalData] = useState<ImageData | null>(null);
  const [mergeSelected, setMergeSelected] = useState<boolean[][] | null>(null);
  const [originalSelected, setOriginalSelected] = useState<boolean[][] | null>(
    null
  );

  return (
    <div className="flex flex-col items-center space-y-2">
      <Settings
        zoom={zoom}
        mode={mode}
        setGuide={setGuide}
        setZoom={setZoom}
        setMode={setMode}
      />
      <div className="flex space-x-4">
        <Button text="이어서 병합" />
        <Button text="png 다운로드" />
        <Button text="xnb 다운로드" />
      </div>
      <div className="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0 pt-2 pb-8">
        <Canvas
          title={`병합용 파일 ${mergeName}`}
          data={mergeData}
          zoom={zoom}
          mode={mode}
          guide={null}
          onUpload={(filename, data) => {
            setMergeName(filename);
            setMergeData(data);
            setMergeSelected(array2d(data.height, data.width, false));
          }}
          onSelect={console.log}
        />
        <Canvas
          title={`원본 파일 ${originalName}`}
          data={originalData}
          zoom={zoom}
          mode={mode}
          guide={guide}
          onUpload={(filename, data) => {
            setOriginalName(filename);
            setOriginalData(data);
            setOriginalSelected(array2d(data.height, data.width, false));
          }}
          onSelect={console.log}
        />
      </div>
    </div>
  );
};
