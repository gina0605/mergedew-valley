import Image from "next/image";
import { useId } from "react";

export interface CanvasProps {
  title: string;
  img: any;
  onUpload: (img: any) => void;
}

export const Canvas = ({ title, img, onUpload }: CanvasProps) => {
  const inputId = useId();

  return (
    <div className="flex flex-col">
      <p className="canvas-title">{title}</p>
      <div className="canvas">
        {img === null && (
          <>
            <label htmlFor={inputId}>
              <div className="w-full h-full flex items-center justify-center cursor-pointer">
                <Image
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
                if (e.target.files?.length === 1) onUpload(e.target.files[0]);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};
