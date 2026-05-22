// Converts a zero-based index to a letter sequence: 0=a, 1=b, …, 25=z, 26=aa, 27=ab, … 701=zz, 702=aaa …
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

// Named suffixes for the first tier (K through Qi).  After quintillion the
// letter system takes over: sextillion = "a", septillion = "b", … nonillion
// = "z", decillion = "aa", … and so on up to the JS float ceiling (~1.79e308).
const NAMED: { v: number; s: string }[] = [
  { v: 1e18, s: "Qi" },
  { v: 1e15, s: "Q" },
  { v: 1e12, s: "T" },
  { v: 1e9, s: "B" },
  { v: 1e6, s: "M" },
  { v: 1e3, s: "K" },
];

export function formatNumber(n: number): string {
  if (isNaN(n)) return "0";
  if (!isFinite(n)) return "∞";
  if (n < 0) return "-" + formatNumber(-n);

  if (n < 1000) {
    if (n < 10 && n % 1 !== 0) return n.toFixed(1);
    return Math.floor(n).toString();
  }

  // Letter suffix system — starts at 1e21 (sextillion = "a").
  // Correctly produces a→z, then aa→az, ba→bz, …, za→zz, aaa→…
  if (n >= 1e21) {
    const exp = Math.floor(Math.log10(n));
    const tier = Math.floor(exp / 3);
    const letterIndex = tier - 7; // tier 7 = 1e21 = index 0 = "a"
    const mantissa = n / Math.pow(10, tier * 3);
    // Clamp mantissa display to avoid "1000.00x" from floating-point noise
    const display = mantissa >= 999.5 ? "1.00" + indexToLetters(letterIndex + 1)
                  : mantissa.toFixed(2) + indexToLetters(letterIndex);
    return display;
  }

  for (const u of NAMED) {
    if (n >= u.v) return (n / u.v).toFixed(1) + u.s;
  }

  return n.toString();
}

export const formatGold = formatNumber;
