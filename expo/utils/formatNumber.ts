function indexToLetters(i: number): string {
  let n = i + 1;
  let s = "";
  while (n > 0) {
    n--;
    s = String.fromCharCode(97 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}

export function formatNumber(n: number): string {
  if (!isFinite(n)) return "∞";
  if (n < 0) return "-" + formatNumber(-n);
  if (n < 1000) {
    if (n < 10 && n % 1 !== 0) return n.toFixed(1);
    return Math.floor(n).toString();
  }
  const units: { v: number; s: string }[] = [
    { v: 1e18, s: "Qi" },
    { v: 1e15, s: "Q" },
    { v: 1e12, s: "T" },
    { v: 1e9, s: "B" },
    { v: 1e6, s: "M" },
    { v: 1e3, s: "K" },
  ];
  if (n >= 1e21) {
    const tier = Math.floor(Math.log10(n) / 3);
    const letterIndex = tier - 7;
    const mantissa = n / Math.pow(10, tier * 3);
    return mantissa.toFixed(2) + indexToLetters(letterIndex);
  }
  for (const u of units) {
    if (n >= u.v) {
      return (n / u.v).toFixed(1) + u.s;
    }
  }
  return n.toString();
}

export const formatGold = formatNumber;
