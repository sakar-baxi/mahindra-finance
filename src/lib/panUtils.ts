/**
 * Indian PAN format: ABCDE1234F (5 uppercase letters + 4 digits + 1 uppercase letter).
 * Third character is entity type (P=Individual, F=Firm, etc.); we use random for demo.
 */

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";

/** Regex for valid Indian PAN. */
export const INDIAN_PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

/** Validate string as Indian PAN format. */
export function isValidIndianPan(pan: string): boolean {
  const trimmed = (pan || "").toUpperCase().trim();
  return trimmed.length === 10 && INDIAN_PAN_REGEX.test(trimmed);
}

/**
 * Generate a unique Indian PAN from a seed (deterministic).
 * Uses seed to pick random alphanumerics in format: 5 letters + 4 digits + 1 letter.
 */
export function generateIndianPan(seed: number): string {
  let s = seed;
  const nextLetter = () => {
    const i = Math.abs(s) % LETTERS.length;
    s = (s * 1103515245 + 12345) >>> 0;
    return LETTERS[i];
  };
  const nextDigit = () => {
    const i = Math.abs(s) % DIGITS.length;
    s = (s * 1103515245 + 12345) >>> 0;
    return DIGITS[i];
  };
  const p1 = [nextLetter(), nextLetter(), nextLetter(), nextLetter(), nextLetter()].join("");
  const p2 = [nextDigit(), nextDigit(), nextDigit(), nextDigit()].join("");
  const p3 = nextLetter();
  return `${p1}${p2}${p3}`;
}
