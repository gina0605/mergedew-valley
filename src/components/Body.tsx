import { useEffect, useState } from "react";
import { ScrollSync } from "react-scroll-sync";
import { pack } from "../xnb/xnb";
import { intoRange } from "@/utils";
import { Settings } from "./Settings";
import { Canvas } from "./Canvas";
import { Button } from "./Button";

export const Body = () => {
  const [scrollSync, setScrollSync] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [guide, setGuide] = useState<string | null>(null);
  const [xOffset, setXOffset] = useState(0);
  const [yOffset, setYOffset] = useState(0);
  const [scale, setScale] = useState(1);
  const [mergeName, setMergeName] = useState("");
  const [mergeData, setMergeData] = useState<ImageData | null>(null);
  const [originalName, setOriginalName] = useState("");
  const [originalData, setOriginalData] = useState<ImageData | null>(null);
  const [target, setTarget] = useState<number[] | null>(null);
  const [originalCurrent, setOriginalCurrent] = useState<ImageData | null>(
    null
  );
  const [warning, setWarning] = useState<string | null>(null);
  const [autoSelect, setAutoSelect] = useState<number[] | null>(null);
  const [autoFix, setAutoFix] = useState<number[] | null>(null);

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

  const getDataRange = (data: ImageData, range: number[]) => {
    const isFilled = (x: number, y: number) =>
      data.data[(y * data.width + x) * 4 + 3] > 0;

    const [x1, y1, x2, y2] = range;

    let xmn = -1,
      xmx = -1,
      ymn = +1,
      ymx = -1;
    for (let y = y1; y <= y2 && xmn === -1; y++)
      for (let x = x1; x <= x2; x++)
        if (isFilled(x, y)) {
          xmn = xmx = x;
          ymn = ymx = y;
          break;
        }
    if (xmn === -1) return null;

    for (let y = y2; y > ymx; y--)
      for (let x = x1; x <= x2; x++)
        if (isFilled(x, y)) {
          xmn = Math.min(xmn, x);
          xmx = Math.max(xmx, x);
          ymx = y;
          break;
        }

    for (let x = x1; x < xmn; x++)
      for (let y = ymn; y <= ymx; y++)
        if (isFilled(x, y)) {
          xmn = x;
          break;
        }
    for (let x = x2; x > xmx; x--)
      for (let y = ymn; y <= ymx; y++)
        if (isFilled(x, y)) {
          xmx = x;
          break;
        }

    return [xmn, ymn, xmx, ymx];
  };

  useEffect(() => {
    setOriginalCurrent(createOriginalCurrent());
  }, [mergeData, originalData, target, xOffset, yOffset, scale]);

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

  useEffect(() => {
    if (!mergeData) setAutoSelect(null);
    else
      setAutoSelect(
        getDataRange(mergeData, [
          0,
          0,
          mergeData.width - 1,
          mergeData.height - 1,
        ])
      );
  }, [mergeData]);

  useEffect(() => {
    if (!mergeData || !target) setAutoFix(null);
    else setAutoFix(getDataRange(mergeData, target));
  }, [mergeData, target]);

  useEffect(() => {
    setScrollSync(
      !!mergeData &&
        !!originalCurrent &&
        mergeData.width === originalCurrent.width &&
        mergeData.height === originalCurrent.height
    );
  }, [mergeData, originalCurrent]);

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

    const getDataScaled = (data: ImageData, scale: number) => {
      if (scale === 1) return data;
      const nw = Math.round(data.width * scale);
      const nh = Math.round(data.height * scale);
      const d = Array(nw * nh * 4).fill(0);
      for (let i = 0; i < nh; i += 1)
        for (let j = 0; j < nw; j += 1)
          for (let k = 0; k < 4; k += 1)
            d[i * nw * 4 + j * 4 + k] =
              data.data[
                Math.floor(i / scale) * data.width * 4 +
                  Math.floor(j / scale) * 4 +
                  k
              ];
      const uintc8 = new Uint8ClampedArray(d);
      return new ImageData(uintc8, nw, nh);
    };

    const cnvs = document.createElement("canvas");
    const data = getDataScaled(originalData, scale);
    cnvs.width = data.width;
    cnvs.height = data.height;
    cnvs.getContext("2d")?.putImageData(data, 0, 0);
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
    cnvs.toBlob(async (b) => {
      if (b === null) return;
      const file = new File([b], getFileName("png"));
      const dt = new DataTransfer();
      dt.items.add(file);
      const r = await pack(dt.files);
      if (r.length !== 1) console.log("something went wrong");
      downloadFile(URL.createObjectURL(r[0].data), getFileName("xnb"));
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
        scrollSync={scrollSync}
        scrollSyncable={
          !!mergeData &&
          !!originalCurrent &&
          mergeData.width === originalCurrent.width &&
          mergeData.height === originalCurrent.height
        }
        zoom={zoom}
        xOffset={xOffset}
        yOffset={yOffset}
        setScrollSync={setScrollSync}
        setZoom={setZoom}
        setGuide={(g: string) => {
          if (guide) URL.revokeObjectURL(guide);
          setGuide(g);
        }}
        setXOffset={setXOffset}
        setYOffset={setYOffset}
        setScale={setScale}
      />
      {target ? (
        <Button
          text="영역 자동 조정하기"
          disabled={
            !autoFix ||
            (autoFix[0] === target[0] &&
              autoFix[1] === target[1] &&
              autoFix[2] === target[2] &&
              autoFix[3] === target[3])
          }
          long
          onClick={() => setTarget(autoFix)}
        />
      ) : (
        <Button
          text="영역 자동 선택하기"
          long
          disabled={!autoSelect}
          onClick={() => setTarget(autoSelect)}
        />
      )}
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
      <ScrollSync enabled={scrollSync}>
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0 py-2">
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
              const q = [
                p[0] - xOffset + r[0],
                p[1] - yOffset + r[1],
                p[2] - xOffset + r[0],
                p[3] - yOffset + r[1],
              ];
              if (
                q[0] >= mergeData.width ||
                q[1] >= mergeData.height ||
                q[2] < 0 ||
                q[3] < 0
              )
                alert("병합용 이미지와 겹치는 범위를 선택해주세요.");
              else
                setTarget(
                  intoRange(q, [
                    0,
                    0,
                    mergeData.width - 1,
                    mergeData.height - 1,
                  ])
                );
            }}
            onDelete={confirmThen(() => {
              setOriginalData(null);
              setOriginalName("");
            })}
          />
        </div>
      </ScrollSync>
    </div>
  );
};
