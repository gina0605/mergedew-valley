import { useEffect, useId, useRef, useState, MouseEvent, Touch } from "react";
import { default as NextImage } from "next/image";
import { unpackToContent } from "xnb";

export interface CanvasProps {
  title: string;
  data: ImageData | null;
  zoom: number;
  mode: string;
  guide: File | null;
  onUpload: (filename: string, data: ImageData) => void;
  onSelect: (x1: number, y1: number, x2: number, y2: number) => void;
}

export const Canvas = ({
  title,
  data,
  zoom,
  mode,
  guide,
  onUpload,
  onSelect,
}: CanvasProps) => {
  const inputId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const guideRef = useRef<HTMLCanvasElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [prevZoom, setPrevZoom] = useState(1);
  const [x1, setX1] = useState<number | null>(null);
  const [y1, setY1] = useState<number | null>(null);

  const setupCanvas = (w: number, h: number, z: number) => {
    const cnvs = canvasRef.current as HTMLCanvasElement;
    const ctx = cnvs.getContext("2d") as CanvasRenderingContext2D;
    ctx.canvas.width = w;
    ctx.canvas.height = h;
    ctx.canvas.style.width = `${w * z}px`;
    ctx.canvas.style.height = `${h * z}px`;
    return ctx;
  };

  useEffect(() => {
    if (data !== null) {
      const scroller = scrollerRef.current as HTMLDivElement;
      const xCenter =
        (scroller.scrollLeft + scroller.clientWidth / 2) / prevZoom;
      const yCenter =
        (scroller.scrollTop + scroller.clientHeight / 2) / prevZoom;
      const ctx = setupCanvas(width, height, zoom);
      setPrevZoom(zoom);
      const guideCnvs = guideRef.current as HTMLCanvasElement;
      const guideCtx = guideCnvs.getContext("2d") as CanvasRenderingContext2D;
      guideCtx.canvas.style.width = `${guideCtx.canvas.width * zoom}px`;
      guideCtx.canvas.style.height = `${guideCtx.canvas.height * zoom}px`;
      ctx.putImageData(data, 0, 0);
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
    }
  }, [width, height, zoom]);

  useEffect(() => {
    if (!guide) return;
    const img = new Image();
    img.src = URL.createObjectURL(guide);
    img.addEventListener("load", () => {
      const cnvs = guideRef.current as HTMLCanvasElement;
      const ctx = cnvs.getContext("2d") as CanvasRenderingContext2D;
      ctx.canvas.width = img.width;
      ctx.canvas.height = img.height;
      ctx.canvas.style.width = `${img.width * zoom}px`;
      ctx.canvas.style.height = `${img.height * zoom}px`;
      ctx.drawImage(img, 0, 0);
    });
  }, [guide]);

  const getCoord = (e: MouseEvent | Touch) => {
    const cnvs = canvasRef.current as HTMLCanvasElement;
    const bounding = cnvs.getBoundingClientRect();
    return [
      Math.floor((e.clientX - bounding.left) / zoom),
      Math.floor((e.clientY - bounding.top) / zoom),
    ];
  };

  const onMouseDown = (e: MouseEvent) => {
    if (mode !== "drag") return;
    const [x, y] = getCoord(e);
    setX1(x);
    setY1(y);
  };

  const onMouseUp = (e: MouseEvent) => {
    if (mode != "drag") return;
    const [x2, y2] = getCoord(e);
    onSelect(x1 as number, y1 as number, x2, y2);
    setX1(null);
    setY1(null);
  };

  const onMouseLeave = (e: MouseEvent) => {
    setX1(null);
    setY1(null);
  };

  const onTouch = (e: MouseEvent) => {
    if (mode !== "touch") return;
    const [x, y] = getCoord(e);
    if (x1 === null) {
      setX1(x);
      setY1(y);
    } else {
      onSelect(x1 as number, y1 as number, x, y);
      setX1(null);
      setY1(null);
    }
  };

  return (
    <div className="flex flex-col">
      <p className="canvas-title">{title}</p>
      <div
        ref={scrollerRef}
        className={`canvas relative ${
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
              onChange={async (e) => {
                if (e.target.files?.length !== 1) return;
                const file = e.target.files[0];
                const img = new Image();
                img.src = URL.createObjectURL(
                  file.type === "image/png"
                    ? file
                    : (await unpackToContent(file)).content
                );
                img.addEventListener("load", () => {
                  const ctx = setupCanvas(img.width, img.height, zoom);
                  ctx.drawImage(img, 0, 0);
                  setWidth(img.width);
                  setHeight(img.height);
                  onUpload(
                    file.name,
                    ctx.getImageData(0, 0, img.width, img.height)
                  );
                });
              }}
            />
          </>
        )}
        <canvas ref={guideRef} className="absolute z-0" />
        <canvas
          ref={canvasRef}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onClick={onTouch}
          className="relative z-20"
        />
      </div>
    </div>
  );
};
