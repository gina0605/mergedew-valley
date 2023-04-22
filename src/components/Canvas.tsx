export const Canvas = ({ title }: { title: string }) => (
  <div className="flex flex-col">
    <p className="w-96 font-pretendard truncate">{title}</p>
    <div className="w-96 h-96 border-2 border-black"></div>
  </div>
);
