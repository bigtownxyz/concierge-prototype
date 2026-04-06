/**
 * Convert a flag emoji (e.g. 🇰🇳) to a 2-letter ISO country code (e.g. "kn"),
 * then return a flag image URL from flagcdn.com.
 */

// Flag emoji -> country code mapping (regional indicator symbols)
function emojiToCode(emoji: string): string {
  const codePoints = [...emoji]
    .map((c) => c.codePointAt(0)!)
    .filter((cp) => cp >= 0x1f1e6 && cp <= 0x1f1ff)
    .map((cp) => String.fromCharCode(cp - 0x1f1e6 + 65));
  return codePoints.join("").toLowerCase();
}

export function getFlagUrl(flagEmoji: string, size: number = 64): string {
  const code = emojiToCode(flagEmoji);
  if (!code || code.length !== 2) return "";
  // flagcdn.com provides SVG and PNG flags
  return `https://flagcdn.com/w${size}/${code}.png`;
}

export function getFlagSvgUrl(flagEmoji: string): string {
  const code = emojiToCode(flagEmoji);
  if (!code || code.length !== 2) return "";
  return `https://flagcdn.com/${code}.svg`;
}
