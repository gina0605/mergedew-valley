import {
  useEffect,
  useId,
  useRef,
  useState,
  MouseEvent,
  Touch,
  ChangeEvent,
} from "react";
import { default as NextImage } from "next/image";
import { unpackToContent } from "xnb";

export interface CanvasProps {
  title: string;
  data: ImageData | null;
  zoom: number;
  mode: string;
  guide: string | null;
  onUpload: (filename: string, data: ImageData) => void;
  onSelect: (pos1: number[], pos2: number[]) => void;
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
  const [prevZoom, setPrevZoom] = useState(1);
  const [mousePos, setMousePos] = useState<number[] | null>(null);
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
    if (!canvasRef.current || !data) return;
    const cnvs = canvasRef.current as HTMLCanvasElement;
    setupCanvas(cnvs, data.width, data.height);
    const ctx = cnvs.getContext("2d") as CanvasRenderingContext2D;
    ctx.putImageData(data, 0, 0);
  }, [data]);

  useEffect(() => {
    if (!guideRef.current) return;
    if (guide) {
      setShowGuide(true);
      const img = new Image();
      img.src = guide;
      img.addEventListener("load", () => {
        drawImage(guideRef.current as HTMLCanvasElement, img);
      });
    } else {
      setShowGuide(false);
    }
  }, [guide]);

  const getCoord = (e: MouseEvent | Touch) => {
    const cnvs = canvasRef.current as HTMLCanvasElement;
    const bounding = cnvs.getBoundingClientRect();
    return [
      Math.floor((e.clientX - bounding.left) / zoom),
      Math.floor((e.clientY - bounding.top) / zoom),
    ];
  };

  const onMouseUp = (e: MouseEvent) => {
    if (mode != "drag" || mousePos === null) return;
    onSelect(mousePos, getCoord(e));
    setMousePos(null);
  };

  const onTouch = (e: MouseEvent) => {
    if (mode !== "touch") return;
    if (mousePos === null) {
      setMousePos(getCoord(e));
    } else {
      onSelect(mousePos, getCoord(e));
      setMousePos(null);
    }
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
      <div className="flex space-x-1 w-full">
        <p
          className={`font-omyu w-6 h-6 font-black cursor-pointer text-lg text-center mb-0.5 -mt-0.5 ${
            showGuide ? "text-black" : "text-slate-300"
          }`}
          onClick={() => setShowGuide((x) => !x)}
        >
          G
        </p>
        <p className="font-pretendard overflow-truncate grow">{title}</p>
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
        <canvas
          ref={canvasRef}
          onMouseDown={
            mode === "drag" ? (e) => setMousePos(getCoord(e)) : undefined
          }
          onMouseUp={onMouseUp}
          onMouseLeave={() => setMousePos(null)}
          onClick={onTouch}
          className="relative z-20"
        />
      </div>
    </div>
  );
};
