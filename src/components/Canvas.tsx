import {
  useEffect,
  useId,
  useRef,
  useState,
  MouseEvent,
  ChangeEvent,
} from "react";
import { default as NextImage } from "next/image";
import { unpackToContent } from "xnb";
import { SelectIcon } from "./SelectIcon";
import { intoRange } from "@/utils";

export interface CanvasProps {
  title: string;
  data: ImageData | null;
  zoom: number;
  guide: string | null;
  target: number[] | null;
  defaultSelectable?: boolean;
  onUpload: (filename: string, data: ImageData) => void;
  onSelect: (v: number[]) => void;
  onDelete: () => void;
}

export const Canvas = ({
  title,
  data,
  zoom,
  guide,
  target,
  defaultSelectable,
  onUpload,
  onSelect,
  onDelete,
}: CanvasProps) => {
  const inputId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const guideRef = useRef<HTMLCanvasElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [prevZoom, setPrevZoom] = useState(1);
  const [dotPos, setDotPos] = useState<number[] | null>(null);
  const [selectable, setSelectable] = useState(defaultSelectable);
  const [showGuide, setShowGuide] = useState(false);

  const updateCanvasZoom = (cnvs: HTMLCanvasElement) => {
    cnvs.style.width = `${cnvs.width * zoom}px`;
    cnvs.style.height = `${cnvs.height * zoom}px`;
  };

  const setupCanvas = (cnvs: HTMLCanvasElement, w: number, h: number) => {
    cnvs.width = w;
    cnvs.height = h;
    cnvs.style.width = `${w * zoom}px`;
    cnvs.style.height = `${h * zoom}px`;
  };

  const drawImage = (cnvs: HTMLCanvasElement, img: HTMLImageElement) => {
    setupCanvas(cnvs, img.width, img.height);
    const ctx = cnvs.getContext("2d") as CanvasRenderingContext2D;
    ctx.drawImage(img, 0, 0);
    return ctx;
  };

  const zoomScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const xCenter = (scroller.scrollLeft + scroller.clientWidth / 2) / prevZoom;
    const yCenter = (scroller.scrollTop + scroller.clientHeight / 2) / prevZoom;
    const xScroll = Math.max(
      0,
      Math.min(
        xCenter * zoom - scroller.clientWidth / 2,
        scroller.scrollWidth - scroller.clientWidth
      )
    );
    const yScroll = Math.max(
      0,
      Math.min(
        yCenter * zoom - scroller.clientHeight / 2,
        scroller.scrollHeight - scroller.clientHeight
      )
    );
    scroller.scrollTo(xScroll, yScroll);
  };

  useEffect(() => {
    if (!canvasRef.current || !guideRef.current) return;
    if (data !== null) {
      updateCanvasZoom(canvasRef.current);
      updateCanvasZoom(guideRef.current);
      zoomScroll();
      setPrevZoom(zoom);
    }
  }, [zoom]);

  useEffect(() => {
    scrollerRef.current?.scrollTo(0, 0);
    if (!canvasRef.current || !data) return;
    const cnvs = canvasRef.current as HTMLCanvasElement;
    setupCanvas(cnvs, data.width, data.height);
    const ctx = cnvs.getContext("2d") as CanvasRenderingContext2D;
    const modifData = data.data.slice();

    const mark = (pos: number[]) => {
      if (
        pos[0] < 0 ||
        pos[0] >= data.width ||
        pos[1] < 0 ||
        pos[1] >= data.height
      )
        return;
      const idx = pos[1] * data.width + pos[0];
      modifData[idx * 4] = 255;
      modifData[idx * 4 + 1] = 0;
      modifData[idx * 4 + 2] = 0;
      modifData[idx * 4 + 3] = 255;
    };

    if (selectable) {
      if (target) {
        let [x1, y1, x2, y2] = intoRange(target, [
          0,
          0,
          data.width - 1,
          data.height - 1,
        ]);
        for (let i = y1; i <= y2; i++)
          for (let j = x1; j <= x2; j++) {
            const idx = i * data.width + j;
            modifData[idx * 4] = data.data[idx * 4] / 2;
            modifData[idx * 4 + 1] = data.data[idx * 4 + 1] / 2;
            modifData[idx * 4 + 2] = data.data[idx * 4 + 2] / 2;
            modifData[idx * 4 + 3] = 127 + data.data[idx * 4 + 3] / 2;
          }
      }
      if (dotPos) mark(dotPos);
      else if (target) {
        mark([target[0], target[1]]);
        mark([target[0], target[3]]);
        mark([target[2], target[1]]);
        mark([target[2], target[3]]);
      }
    }
    ctx.putImageData(new ImageData(modifData, data.width, data.height), 0, 0);
  }, [data, dotPos, target, selectable]);

  useEffect(() => setDotPos(null), [data, target, selectable]);

  useEffect(() => {
    if (!guideRef.current) return;
    const guideCanvas = guideRef.current as HTMLCanvasElement;
    if (guide) {
      setShowGuide(true);
      const img = new Image();
      img.src = guide;
      img.addEventListener("load", () => {
        drawImage(guideCanvas, img);
      });
    } else {
      setShowGuide(false);
      guideCanvas.width = 0;
      guideCanvas.height = 0;
      guideCanvas.style.width = "0";
      guideCanvas.style.height = "0";
    }
  }, [guide]);

  const getCoord = (e: MouseEvent) => {
    const cnvs = canvasRef.current as HTMLCanvasElement;
    const bounding = cnvs.getBoundingClientRect();
    return [
      Math.floor((e.clientX - bounding.left) / zoom),
      Math.floor((e.clientY - bounding.top) / zoom),
    ];
  };

  const onClick = (e: MouseEvent) => {
    if (!selectable || !canvasRef.current) return;
    const p = getCoord(e);
    if (dotPos) {
      onSelect([
        Math.min(dotPos[0], p[0]),
        Math.min(dotPos[1], p[1]),
        Math.max(dotPos[0], p[0]),
        Math.max(dotPos[1], p[1]),
      ]);
      setDotPos(null);
    } else if (!target) setDotPos(p);
    else if (
      (p[0] === target[0] || p[0] === target[2]) &&
      (p[1] === target[1] || p[1] === target[3])
    )
      setDotPos([target[0] + target[2] - p[0], target[1] + target[3] - p[1]]);
  };

  const onImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length !== 1 || !canvasRef.current) return;
    const file = e.target.files[0];
    const img = new Image();
    img.src = URL.createObjectURL(
      file.type === "image/png" ? file : (await unpackToContent(file)).content
    );
    img.addEventListener("load", () => {
      const ctx = drawImage(canvasRef.current as HTMLCanvasElement, img);
      onUpload(file.name, ctx.getImageData(0, 0, img.width, img.height));
    });
  };

  return (
    <div className="flex flex-col w-[90vw] md:w-[40vw]">
      <div className="flex w-full items-center">
        <SelectIcon
          value={selectable ?? false}
          onClick={() => setSelectable((v) => !v)}
        />
        <p
          className={`font-omyu w-6 h-6 font-black cursor-pointer text-lg text-center mb-0.5 -mt-0.5 prevent-select ${
            showGuide ? "text-slate-700" : "text-slate-300"
          }`}
          onClick={() => setShowGuide((x) => !x)}
        >
          G
        </p>
        <p className="font-pretendard overflow-truncate grow">{title}</p>
        {data && (
          <NextImage
            src="/assets/icon-x.svg"
            alt="X"
            width="18"
            height="18"
            className="cursor-pointer"
            onClick={onDelete}
          />
        )}
      </div>
      <div
        ref={scrollerRef}
        className={`border-2 border-black w-full h-[90vw] md:h-[40vw] relative ${
          data === null ? "overflow-hidden" : "overflow-scroll"
        }`}
      >
        {data === null && (
          <>
            <label htmlFor={inputId}>
              <div className="w-full h-full flex items-center justify-center cursor-pointer">
                <NextImage
                  src="/assets/icon-plus.svg"
                  alt="add button"
                  width="36"
                  height="36"
                />
              </div>
            </label>
            <input
              id={inputId}
              type="file"
              name="merge-image"
              accept="image/png,.xnb"
              className="hidden"
              onChange={onImageUpload}
            />
          </>
        )}
        <canvas
          ref={guideRef}
          className={`absolute z-0 ${showGuide ? "" : "hidden"}`}
        />
        <canvas ref={canvasRef} onClick={onClick} className="relative z-20" />
      </div>
    </div>
  );
};
