import { Settings } from "./Settings";
import { Canvas } from "./Canvas";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import { intoRange } from "@/utils";
import { pack } from "xnb";

export const Body = () => {
  const [zoom, setZoom] = useState(1);
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

  const getOriginalCurrentRange = () => {
    if (!originalData) return [0, 0, 0, 0];
    if (!target) return [0, 0, originalData.width, originalData.height];
    let [tx1, ty1, tx2, ty2] = target;
    return [
      Math.min(0, tx1 + xOffset),
      Math.min(0, ty1 + yOffset),
      Math.max(originalData.width, tx2 + xOffset),
      Math.max(originalData.height, ty2 + yOffset),
    ];
  };

  const createOriginalCurrent = () => {
    if (originalData === null || mergeData === null || target === null)
      return originalData;

    let [x1, y1, x2, y2] = getOriginalCurrentRange();

    const isTarget = (x: number, y: number) =>
      target[0] <= x && x <= target[2] && target[1] <= y && y <= target[3];

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
    setOriginalCurrent(createOriginalCurrent());
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
    if (originalData === null) return null;
    const cnvs = document.createElement("canvas");
    cnvs.width = originalData.width;
    cnvs.height = originalData.height;
    cnvs.getContext("2d")?.putImageData(originalData, 0, 0);
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

  const confirmThen = (f: () => void) => () => {
    if (target) {
      if (confirm("확정되지 않은 영역이 있습니다. 파일을 삭제할까요?")) f();
    } else f();
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <Settings
        zoom={zoom}
        xOffset={xOffset}
        yOffset={yOffset}
        setGuide={(g: string) => {
          if (guide) URL.revokeObjectURL(guide);
          setGuide(g);
        }}
        setZoom={setZoom}
        setXOffset={setXOffset}
        setYOffset={setYOffset}
      />
      <div className="flex space-x-4">
        {target ? (
          <>
            <Button
              text="영역 확정하기"
              disabled={originalData === null || mergeData === null}
              onClick={() => {
                setOriginalData(createOriginalCurrent());
                setTarget(null);
              }}
            />
            <Button
              text="영역 선택 취소"
              disabled={mergeData === null}
              onClick={() => setTarget(null)}
            />
          </>
        ) : (
          <>
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
          </>
        )}
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
          onDelete={confirmThen(() => {
            setMergeData(null);
            setMergeName("");
            setTarget(null);
          })}
        />
        <Canvas
          title={`원본 파일 ${originalName}`}
          data={originalCurrent}
          zoom={zoom}
          guide={guide}
          target={(() => {
            if (!target) return null;
            const r = getOriginalCurrentRange();
            return [
              target[0] + xOffset - r[0],
              target[1] + yOffset - r[1],
              target[2] + xOffset - r[0],
              target[3] + yOffset - r[1],
            ];
          })()}
          onUpload={(filename, data) => {
            setOriginalName(filename);
            setOriginalData(data);
          }}
          onSelect={(p) => {
            if (!mergeData) return;
            const r = getOriginalCurrentRange();
            setTarget(
              intoRange(
                [
                  p[0] - xOffset + r[0],
                  p[1] - yOffset + r[1],
                  p[2] - xOffset + r[0],
                  p[3] - yOffset + r[1],
                ],
                [0, 0, mergeData.width - 1, mergeData.height - 1]
              )
            );
          }}
          onDelete={confirmThen(() => {
            setOriginalData(null);
            setOriginalName("");
          })}
        />
      </div>
    </div>
  );
};
