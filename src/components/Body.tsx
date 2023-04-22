import { Settings } from "./Settings";
import { Canvas } from "./Canvas";
import { useState } from "react";
import { Button } from "./Button";

export const Body = () => {
  const [mergeName, setMergeName] = useState("");
  const [mergeData, setMergeData] = useState<Uint8ClampedArray | null>(null);
  const [originalName, setOriginalName] = useState("");
  const [originalData, setOriginalData] = useState<Uint8ClampedArray | null>(
    null
  );

  return (
    <div className="flex flex-col items-center space-y-2">
      <Settings />
      <div className="flex space-x-4">
        <Button text="이어서 병합" />
        <Button text="png 다운로드" />
        <Button text="xnb 다운로드" />
      </div>
      <div className="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0 pt-2">
        <Canvas
          title={`병합용 파일 ${mergeName}`}
          data={mergeData}
          onUpload={(filename, data) => {
            setMergeName(filename);
            setMergeData(data);
          }}
        />
        <Canvas
          title={`원본 파일 ${originalName}`}
          data={originalData}
          onUpload={(filename, data) => {
            setOriginalName(filename);
            setOriginalData(data);
          }}
        />
      </div>
    </div>
  );
};
