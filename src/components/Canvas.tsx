import { default as NextImage } from "next/image";
import { useId, useRef } from "react";

export interface CanvasProps {
  title: string;
  data: any;
  onUpload: (filename: string, data: Uint8ClampedArray) => void;
}

export const Canvas = ({ title, data, onUpload }: CanvasProps) => {
  const inputId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
              onChange={(e) => {
                if (e.target.files?.length !== 1) return;
                const file = e.target.files[0];
                const img = new Image();
                img.src = URL.createObjectURL(file);
                const cnvs = canvasRef.current as HTMLCanvasElement;
                const ctx = cnvs.getContext("2d") as CanvasRenderingContext2D;
                img.addEventListener("load", () => {
                  ctx.canvas.width = img.width;
                  ctx.canvas.height = img.height;
                  ctx.drawImage(img, 0, 0);
                  onUpload(
                    file.name,
                    ctx.getImageData(0, 0, img.width, img.height).data
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
