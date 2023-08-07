import {
  useEffect,
  useId,
  useRef,
  useState,
  MouseEvent,
  ChangeEvent,
} from "react";
import { default as NextImage } from "next/image";
import { unpack } from "../unpack";
import { intoRange, minmax } from "@/utils";
import { SelectIcon } from "./SelectIcon";

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

  const getCenter = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return null;
    const xCenter = (scroller.scrollLeft + scroller.clientWidth / 2) / prevZoom;
    const yCenter = (scroller.scrollTop + scroller.clientHeight / 2) / prevZoom;
    return [xCenter, yCenter];
  };

  const zoomScroll = (centerCoord: number[] | null) => {
    const scroller = scrollerRef.current;
    if (!scroller || !centerCoord) return;
    const [xCenter, yCenter] = centerCoord;
    const xScroll = minmax(
      xCenter * zoom - scroller.clientWidth / 2,
      scroller.scrollWidth - scroller.clientWidth,
      0
    );
    const yScroll = minmax(
      yCenter * zoom - scroller.clientHeight / 2,
      scroller.scrollHeight - scroller.clientHeight,
      0
    );
    scroller.scrollTo(xScroll, yScroll);
  };

  useEffect(() => {
    if (!canvasRef.current || !guideRef.current) return;
    if (data !== null) {
      const centerCoord = getCenter();
      updateCanvasZoom(canvasRef.current);
      updateCanvasZoom(guideRef.current);
      zoomScroll(centerCoord);
      setPrevZoom(zoom);
    }
  }, [zoom]);

  useEffect(() => {
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
            const a = data.data[idx * 4 + 3];
            const a_new = Math.floor((a * 2) / 3) + 84;
            modifData[idx * 4] = Math.floor(
              (((data.data[idx * 4] * a) / a_new) * 2) / 3
            );
            modifData[idx * 4 + 1] = Math.floor(
              (((data.data[idx * 4 + 1] * a) / a_new) * 2) / 3
            );
            modifData[idx * 4 + 2] = Math.floor(
              (((data.data[idx * 4 + 2] * a) / a_new) * 2) / 3
            );
            modifData[idx * 4 + 3] = a_new;
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
    if (!data) scrollerRef.current?.scrollTo(0, 0);
  }, [data]);

  useEffect(() => {
    const guideCanvas = guideRef.current;
    if (!guideCanvas) return;
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
    else {
      if (
        Math.min(Math.abs(p[0] - target[0]), Math.abs(p[0] - target[2])) *
          zoom <=
          10 &&
        Math.min(Math.abs(p[1] - target[1]), Math.abs(p[1] - target[3])) *
          zoom <=
          10
      )
        setDotPos([
          p[0] <= (target[0] + target[2]) / 2 ? target[2] : target[0],
          p[1] <= (target[1] + target[3]) / 2 ? target[3] : target[1],
        ]);
    }
  };

  const onImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length !== 1 || !canvasRef.current) return;
    const file = e.target.files[0];
    try {
      const img = new Image();
      img.src = URL.createObjectURL(
        file.type === "image/png" ? file : await unpack(file)
      );
      img.addEventListener("load", () => {
        const ctx = drawImage(canvasRef.current as HTMLCanvasElement, img);
        onUpload(file.name, ctx.getImageData(0, 0, img.width, img.height));
      });
    } catch (e) {
      alert("파일 읽기에 실패했습니다.");
    }
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
        <p className="font-pretendard truncate grow">{title}</p>
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
        className={`border-2 border-black w-full h-[90vw] md:h-[40vw] relative result-box overscroll-contain ${
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
