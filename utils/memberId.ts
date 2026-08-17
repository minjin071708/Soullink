/**
 * Ownership checks for community posts/comments.
 * `memberId` is always a string (auth + community API).
 */
export function normalizeMemberId(
  value: string | null | undefined
): string | null {
  if (value == null) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function isSameMemberId(
  left: string | null | undefined,
  right: string | null | undefined
): boolean {
  const a = normalizeMemberId(left);
  const b = normalizeMemberId(right);
  return a != null && b != null && a === b;
}
