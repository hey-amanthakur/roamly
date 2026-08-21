export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function sanitizeObject<T extends object>(
  obj: T,
  fields: string[]
): T {
  const sanitized = { ...obj } as Record<string, unknown>;
  for (const field of fields) {
    const value = sanitized[field];
    if (typeof value === "string") {
      sanitized[field] = sanitizeText(value);
    }
  }
  return sanitized as T;
}
