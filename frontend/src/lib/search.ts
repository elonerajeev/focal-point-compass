export function normalizeSearchValue(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function tokenizeSearchQuery(query: string) {
  return normalizeSearchValue(query)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}

function hasSubsequence(haystack: string, needle: string) {
  let index = 0;

  for (const char of haystack) {
    if (char === needle[index]) {
      index += 1;
    }

    if (index === needle.length) {
      return true;
    }
  }

  return needle.length === 0;
}

export function scoreSearchText(text: string, query: string) {
  const normalizedText = normalizeSearchValue(text);
  const tokens = tokenizeSearchQuery(query);

  if (!tokens.length) {
    return 1;
  }

  let score = 0;
  for (const token of tokens) {
    if (normalizedText === token) {
      score += 8;
      continue;
    }

    if (normalizedText.startsWith(token)) {
      score += 6;
      continue;
    }

    if (normalizedText.includes(token)) {
      score += 4;
      continue;
    }

    if (hasSubsequence(normalizedText, token)) {
      score += 2;
    }
  }

  return score;
}

export function scoreEntity(fields: string[], query: string) {
  const combined = fields.join(" ");
  const score = scoreSearchText(combined, query);
  return score > 0 ? score : -1;
}
