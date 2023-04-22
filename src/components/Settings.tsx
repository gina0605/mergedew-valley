import Image from "next/image";

export const Settings = () => (
  <div className="flex flex-col items-center border border-slate-300 p-2 mt-2 space-y-2">
    <div className="flex flex-col md:flex-row space-x-4 space-y-1">
      <div className="flex space-x-4 items-center">
        <div className="w-24">
          <select className="border border-slate-300 w-24">
            <option>드래그 모드</option>
            <option>터치 모드</option>
          </select>
        </div>
        <div className="flex space-x-2 items-center">
          <p className="align-middle h-6 leading-6 font-pretendard">확대</p>
          <input type="range" min="1" max="20" />
          <input type="number" min="1" max="20" />
        </div>
      </div>
      <div className="flex md:flex-col justify-center">
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
      <input
        type="file"
        className="w-48 md:w-96 font-pretendard text-sm truncate"
      />
    </div>
  </div>
);
