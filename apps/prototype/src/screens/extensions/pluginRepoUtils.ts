export function extractRepoSlug(value: string): string | null {
  const normalized = value.trim().replace(/\.git$/, '');
  if (!normalized) return null;

  const directSlugMatch = normalized.match(/^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)$/);
  if (directSlugMatch) return directSlugMatch[1];

  const hostSlugMatch = normalized.match(/(?:github\.com|gitlab\.com)[/:]([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)/i);
  if (hostSlugMatch) return hostSlugMatch[1];

  try {
    const parsed = new URL(normalized);
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length >= 2) {
      return `${segments[0]}/${segments[1]}`;
    }
  } catch {
    return null;
  }

  return null;
}

export function normalizeRepoKey(value: string): string | null {
  const slug = extractRepoSlug(value);
  return slug ? slug.toLowerCase() : null;
}

export function toSkillFileName(skillName: string): string {
  return `${skillName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')}.md`;
}
