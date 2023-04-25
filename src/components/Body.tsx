import { Settings } from "./Settings";
import { Canvas } from "./Canvas";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import { array2d, intoRange } from "@/utils";
import { pack } from "xnb";

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
  const [target, setTarget] = useState<number[] | null>(null);
  const [originalCurrent, setOriginalCurrent] = useState<ImageData | null>(
    null
  );
  const [warning, setWarning] = useState<string | null>(null);

  const createOriginalCurrent = (gray: boolean) => {
    if (originalData === null || mergeData === null || target === null)
      return originalData;

    let [sx1, sy1, sx2, sy2] = target;

    let x1 = Math.min(0, sx1 + xOffset),
      y1 = Math.min(0, sy1 + yOffset),
      x2 = Math.max(originalData.width, sx2 + xOffset + 1),
      y2 = Math.max(originalData.height, sy2 + yOffset + 1);

    const isTarget = (x: number, y: number) =>
      sx1 <= x && x <= sx2 && sy1 <= y && y <= sy2;

    const d = Array((x2 - x1) * (y2 - y1) * 4).fill(0);
    for (let i = y1; i < y2; i++)
      for (let j = x1; j < x2; j++) {
        const idx = ((i - y1) * (x2 - x1) + j - x1) * 4;
        if (isTarget(j - xOffset, i - yOffset)) {
          const midx = ((i - yOffset) * mergeData.width + j - xOffset) * 4;
          d[idx] = mergeData.data[midx];
          d[idx + 1] = mergeData.data[midx + 1];
          d[idx + 2] = mergeData.data[midx + 2];
          d[idx + 3] = mergeData.data[midx + 3];
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

  useEffect(() => {
    setOriginalCurrent(createOriginalCurrent(true));
  }, [mergeData, originalData, target, xOffset, yOffset]);

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

  const drawResult = () => {
    const imgData = createOriginalCurrent(false);
    if (imgData === null) return null;
    const cnvs = document.createElement("canvas");
    cnvs.width = imgData.width;
    cnvs.height = imgData.height;
    cnvs.getContext("2d")?.putImageData(imgData, 0, 0);
    return cnvs;
  };

  const getFileName = (ext: string) => originalName.slice(0, -3) + ext;

  const onPngDownload = () => {
    const cnvs = drawResult();
    if (cnvs === null) return;
    downloadFile(cnvs.toDataURL(), getFileName("png"));
    cnvs.remove();
  };

  const onXnbDownload = async () => {
    const cnvs = drawResult();
    if (cnvs === null) return;
    cnvs.toBlob((b) => {
      if (b === null) return;
      const file = new File([b], getFileName("png"));
      const dt = new DataTransfer();
      dt.items.add(file);
      pack(dt.files).then((r: any) => {
        if (r.length !== 1) console.log("something went wrong");
        downloadFile(URL.createObjectURL(r[0].data), getFileName("xnb"));
      });
    });
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
        <Button
          text="xnb 다운로드"
          disabled={originalData === null}
          onClick={onXnbDownload}
        />
      </div>
      {warning && (
        <p className="text-omyu text-red-600 max-w-[90vw] break-keep">
          {warning}
        </p>
      )}
      <div className="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0 pt-2 pb-8">
        <Canvas
          title={`병합용 파일 ${mergeName}`}
          data={mergeData}
          zoom={zoom}
          guide={guide}
          target={target}
          defaultSelectable
          onUpload={(filename, data) => {
            setMergeName(filename);
            setMergeData(data);
          }}
          onSelect={setTarget}
        />
        <Canvas
          title={`원본 파일 ${originalName}`}
          data={originalCurrent}
          zoom={zoom}
          guide={guide}
          target={
            target
              ? [
                  target[0] + xOffset,
                  target[1] + yOffset,
                  target[2] + xOffset,
                  target[3] + yOffset,
                ]
              : null
          }
          onUpload={(filename, data) => {
            setOriginalName(filename);
            setOriginalData(data);
          }}
          onSelect={(p) => {
            if (mergeData)
              setTarget(
                intoRange(
                  [
                    p[0] - xOffset,
                    p[1] - yOffset,
                    p[2] - xOffset,
                    p[3] - yOffset,
                  ],
                  [0, 0, mergeData.width - 1, mergeData.height - 1]
                )
              );
          }}
        />
      </div>
    </div>
  );
};
