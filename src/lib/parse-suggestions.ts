/** Regex matching <<suggested reply text>> */
const SUGGESTION_RE = /<<([^>]+)>>/g;

/** Extract suggested reply strings from text and return cleaned text. */
export function parseSuggestions(text: string): {
  cleaned: string;
  suggestions: string[];
} {
  const suggestions: string[] = [];
  let match: RegExpExecArray | null;

  // Reset lastIndex to ensure fresh matching
  SUGGESTION_RE.lastIndex = 0;
  while ((match = SUGGESTION_RE.exec(text)) !== null) {
    const label = match[1].trim();
    if (label) suggestions.push(label);
  }

  // Remove the <<...>> markers and any trailing whitespace they leave
  const cleaned = text.replace(SUGGESTION_RE, "").trimEnd();

  return { cleaned, suggestions };
}
