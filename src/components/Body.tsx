import { Settings } from "./Settings";
import { Canvas } from "./Canvas";
import { useState } from "react";
import { Button } from "./Button";

export const Body = () => {
  const [mergeName, setMergeName] = useState("");
  const [originalName, setOriginalName] = useState("");

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
          img={null}
          onUpload={(img) => {
            console.log(img);
            setMergeName(img.name);
          }}
        />
        <Canvas
          title={`원본 파일 ${originalName}`}
          img={null}
          onUpload={(img) => {
            console.log(img);
            setOriginalName(img.name);
          }}
        />
      </div>
    </div>
  );
};
