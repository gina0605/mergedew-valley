export const Canvas = ({ title }: { title: string }) => (
  <div className="flex flex-col">
    <p className="canvas-title">{title}</p>
    <div className="canvas"></div>
  </div>
);
