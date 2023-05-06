import { unpackToXnbData, xnbDataToContent } from "./xnb/xnb";

export const unpack = async (file: File) => {
  const xnbData = await unpackToXnbData(file);
  xnbData.content.export.type = "Texture2D";
  return (await xnbDataToContent(xnbData)).content;
};
