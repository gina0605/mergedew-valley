import { useEffect, useId, useRef, useState } from "react";
import { default as NextImage } from "next/image";
import { unpackToContent } from "xnb";

export interface CanvasProps {
  title: string;
  data: any;
  zoom: number;
  onUpload: (filename: string, data: ImageData) => void;
}

export const Canvas = ({ title, data, zoom, onUpload }: CanvasProps) => {
  const inputId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

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
    console.log(width, height, zoom);
    if (data !== null) {
      const ctx = setupCanvas(width, height, zoom);
      ctx.putImageData(data, 0, 0);
    }
  }, [width, height, zoom]);

  return (
    <div className="flex flex-col">
      <p className="canvas-title">{title}</p>
      <div className="canvas overflow-scroll">
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
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
