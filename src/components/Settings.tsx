import Image from "next/image";

export const Settings = () => (
  <div className="flex flex-col items-center border border-slate-300 p-2 mt-2 space-y-4">
    <div className="flex space-x-4">
      <div className="flex space-x-2 items-center">
        <p className="align-middle h-6 leading-6 font-pretendard">확대</p>
        <input type="range" min="1" max="20" />
        <input type="number" min="1" max="20" />
      </div>
      <div className="flex flex-col">
        <div className="flex space-x-3">
          <p className="align-middle h-6 leading-6 font-pretendard">x 오프셋</p>
          <input type="number" className="w-12" />
        </div>
        <div className="flex space-x-3">
          <p className="align-middle h-6 leading-6 font-pretendard">y 오프셋</p>
          <input type="number" className="w-12" />
        </div>
      </div>
    </div>
    <div className="flex space-x-2">
      <Image
        src="/assets/icon-eye.svg"
        alt="eye-open"
        width="24"
        height="24"
        className="cursor-pointer"
      />
      <p className="font-pretendard">가이드라인</p>
      <input type="file" className="w-96 font-pretendard text-sm truncate" />
    </div>
  </div>
);
