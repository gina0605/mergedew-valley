export const array2d = (h: number, w: number, x: any) =>
  Array(h)
    .fill(0)
    .map(() => Array(w).fill(x));

export const betterParseInt = (x: string) => (x === "" ? 0 : parseInt(x));

export const minmax = (x: number, mn: number, mx: number) => {
  return Math.max(Math.min(x, mn), mx);
};

export const intoRange = (p: number[], r: number[]) => {
  const xFix = (x: number) => minmax(x, r[2], r[0]);
  const yFix = (x: number) => minmax(x, r[3], r[1]);
  return [xFix(p[0]), yFix(p[1]), xFix(p[2]), yFix(p[3])];
};
