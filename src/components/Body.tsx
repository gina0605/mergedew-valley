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
  const [warning, setWarning] = useState<string | null>(null);

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

  const createOriginalCurrent = (gray: boolean) => {
    if (originalData === null || mergeData === null || selected === null)
      return originalData;

    let x1 = 0,
      x2 = originalData.width,
      y1 = 0,
      y2 = originalData.height;
    for (let i = 0; i < mergeData.height; i++)
      for (let j = 0; j < mergeData.width; j++)
        if (selected[i][j]) {
          x1 = Math.min(x1, j + xOffset);
          y1 = Math.min(y1, i + yOffset);
          x2 = Math.max(x2, j + xOffset);
          y2 = Math.max(y2, i + yOffset);
        }

    const readSelected = (x: number, y: number) => {
      if (x < 0 || x >= mergeData.width || y < 0 || y >= mergeData.height)
        return false;
      return selected[y][x];
    };

    const d = Array((x2 - x1) * (y2 - y1) * 4).fill(0);
    for (let i = y1; i < y2; i++)
      for (let j = x1; j < x2; j++) {
        const idx = ((i - y1) * (x2 - x1) + j - x1) * 4;
        if (readSelected(j - xOffset, i - yOffset)) {
          const midx = ((i - yOffset) * mergeData.width + j - xOffset) * 4;
          if (gray) {
            d[idx] = mergeData.data[midx] / 2;
            d[idx + 1] = mergeData.data[midx + 1] / 2;
            d[idx + 2] = mergeData.data[midx + 2] / 2;
            d[idx + 3] = 127 + mergeData.data[midx + 3] / 2;
          } else {
            d[idx] = mergeData.data[midx];
            d[idx + 1] = mergeData.data[midx + 1];
            d[idx + 2] = mergeData.data[midx + 2];
            d[idx + 3] = mergeData.data[midx + 3];
          }
        } else if (
          0 <= j &&
          j < originalData.width &&
          0 <= i &&
          i < originalData.height
        ) {
          const oidx = (i * originalData.width + j) * 4;
          d[idx] = originalData.data[oidx];
          d[idx + 1] = originalData.data[oidx + 1];
          d[idx + 2] = originalData.data[oidx + 2];
          d[idx + 3] = originalData.data[oidx + 3];
        }
      }

    const uintc8 = new Uint8ClampedArray(d);
    return new ImageData(uintc8, x2 - x1, y2 - y1);
  };

  const updateSelected = (x1: number, y1: number, x2: number, y2: number) =>
    setSelected((s: boolean[][] | null) => {
      if (s === null || s.length === 0 || s[0].length === 0) return s;
      let v;
      if (0 <= x1 && x1 < s[0].length && 0 <= y1 && y1 < s.length)
        v = !s[y1][x1];
      else v = true;
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
    setOriginalCurrent(createOriginalCurrent(true));
  }, [mergeData, originalData, selected, xOffset, yOffset]);

  useEffect(() => {
    if (!originalData || !originalCurrent) setWarning(null);
    else {
      const w1 = originalData.width,
        h1 = originalData.height,
        w2 = originalCurrent.width,
        h2 = originalCurrent.height;
      if (w1 === w2 && h1 === h2) setWarning(null);
      else
        setWarning(
          `이미지의 크기가 (${w1}, ${h1})에서 (${w2}, ${h2})로 변경됩니다.`
        );
    }
  }, [originalData, originalCurrent]);

  const downloadFile = (href: string, filename: string) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const onPngDownload = () => {
    const imgData = createOriginalCurrent(false);
    if (imgData === null) return;
    const cnvs = document.createElement("canvas");
    cnvs.width = imgData.width;
    cnvs.height = imgData.height;
    cnvs.getContext("2d")?.putImageData(imgData, 0, 0);
    downloadFile(cnvs.toDataURL(), originalName.slice(0, -3) + "png");
    cnvs.remove();
  };

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
        <Button
          text="이어서 병합"
          disabled={originalData === null || mergeData === null}
        />
        <Button
          text="png 다운로드"
          disabled={originalData === null}
          onClick={onPngDownload}
        />
        <Button text="xnb 다운로드" disabled={originalData === null} />
      </div>
      {warning && (
        <p className="text-omyu text-red-600 max-w-[90vw] break-keep">
          {warning}
        </p>
      )}
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
