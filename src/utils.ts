export const array2d = (h: number, w: number, x: any) =>
  Array(h)
    .fill(0)
    .map(() => Array(w).fill(x));
