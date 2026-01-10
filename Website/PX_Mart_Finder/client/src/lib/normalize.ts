export function normalizeAisle(value: string | undefined | null): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  
  const match = trimmed.match(/(\d+)/);
  if (!match) return null;
  
  const num = parseInt(match[1], 10);
  return isNaN(num) ? null : num;
}
