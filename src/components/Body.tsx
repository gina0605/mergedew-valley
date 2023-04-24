import { Settings } from "./Settings";
import { Canvas } from "./Canvas";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import { array2d } from "@/utils";

export const Body = () => {
  const [zoom, setZoom] = useState(1);
  const [mode, setMode] = useState("drag");
  const [guide, setGuide] = useState<string | null>(null);
  const [xOffset, setXOffset] = useState(0);
  const [yOffset, setYOffset] = useState(0);
  const [mergeName, setMergeName] = useState("");
  const [mergeData, setMergeData] = useState<ImageData | null>(null);
  const [originalName, setOriginalName] = useState("");
  const [originalData, setOriginalData] = useState<ImageData | null>(null);
  const [selected, setSelected] = useState<boolean[][] | null>(null);
  const [mergeCurrent, setMergeCurrent] = useState<ImageData | null>(null);
  const [originalCurrent, setOriginalCurrent] = useState<ImageData | null>(
    null
  );

  const createMergeCurrent = () => {
    if (mergeData === null || selected === null) return null;
    const d = Array(mergeData.width * mergeData.height * 4).fill(0);
    for (let i = 0; i < mergeData.width * mergeData.height; i++)
      if (selected[Math.floor(i / mergeData.width)][i % mergeData.width]) {
        d[i * 4] = mergeData.data[i * 4] / 2;
        d[i * 4 + 1] = mergeData.data[i * 4 + 1] / 2;
        d[i * 4 + 2] = mergeData.data[i * 4 + 2] / 2;
        d[i * 4 + 3] = 127 + mergeData.data[i * 4 + 3] / 2;
      } else {
        d[i * 4] = mergeData.data[i * 4];
        d[i * 4 + 1] = mergeData.data[i * 4 + 1];
        d[i * 4 + 2] = mergeData.data[i * 4 + 2];
        d[i * 4 + 3] = mergeData.data[i * 4 + 3];
      }
    const uintc8 = new Uint8ClampedArray(d);
    return new ImageData(uintc8, mergeData.width, mergeData.height);
  };

  const createOriginalCurrent = () => {
    if (originalData === null) return null;
    const d = Array(originalData.width * originalData.height * 4).fill(0);
    for (let i = 0; i < originalData.width * originalData.height; i++)
      if (
        selected !== null &&
        selected[Math.floor(i / originalData.width)][i % originalData.width]
      ) {
        d[i * 4] = originalData.data[i * 4] / 2;
        d[i * 4 + 1] = originalData.data[i * 4 + 1] / 2;
        d[i * 4 + 2] = originalData.data[i * 4 + 2] / 2;
        d[i * 4 + 3] = 127 + originalData.data[i * 4 + 3] / 2;
      } else {
        d[i * 4] = originalData.data[i * 4];
        d[i * 4 + 1] = originalData.data[i * 4 + 1];
        d[i * 4 + 2] = originalData.data[i * 4 + 2];
        d[i * 4 + 3] = originalData.data[i * 4 + 3];
      }

    const uintc8 = new Uint8ClampedArray(d);
    return new ImageData(uintc8, originalData.width, originalData.height);
  };

  const updateSelected = (x1: number, y1: number, x2: number, y2: number) =>
    setSelected((s: boolean[][] | null) => {
      if (s === null || s.length === 0 || s[0].length === 0) return s;
      const v = !s[y1][x1];
      const ss = s.slice();
      for (
        let i = Math.max(Math.min(x1, x2), 0);
        i <= Math.min(Math.max(x1, x2), s[0].length - 1);
        i++
      )
        for (
          let j = Math.max(Math.min(y1, y2), 0);
          j <= Math.min(Math.max(y1, y2), s.length - 1);
          j++
        )
          ss[j][i] = v;
      return ss;
    });

  useEffect(() => {
    setMergeCurrent(createMergeCurrent());
    setOriginalCurrent(createOriginalCurrent());
  }, [mergeData, originalData, selected]);

  return (
    <div className="flex flex-col items-center space-y-2">
      <Settings
        zoom={zoom}
        mode={mode}
        xOffset={xOffset}
        yOffset={yOffset}
        setGuide={setGuide}
        setZoom={setZoom}
        setMode={setMode}
        setXOffset={setXOffset}
        setYOffset={setYOffset}
      />
      <div className="flex space-x-4">
        <Button text="이어서 병합" />
        <Button text="png 다운로드" />
        <Button text="xnb 다운로드" />
      </div>
      <div className="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0 pt-2 pb-8">
        <Canvas
          title={`병합용 파일 ${mergeName}`}
          data={mergeCurrent}
          zoom={zoom}
          mode={mode}
          guide={guide}
          onUpload={(filename, data) => {
            setMergeName(filename);
            setMergeData(data);
            setSelected(array2d(data.height, data.width, false));
          }}
          onSelect={([x1, y1], [x2, y2]) => {
            updateSelected(x1, y1, x2, y2);
          }}
        />
        <Canvas
          title={`원본 파일 ${originalName}`}
          data={originalCurrent}
          zoom={zoom}
          mode={mode}
          guide={guide}
          onUpload={(filename, data) => {
            setOriginalName(filename);
            setOriginalData(data);
          }}
          onSelect={([x1, y1], [x2, y2]) => {
            updateSelected(
              x1 - xOffset,
              y1 - yOffset,
              x2 - xOffset,
              y2 - yOffset
            );
          }}
        />
      </div>
    </div>
  );
};
