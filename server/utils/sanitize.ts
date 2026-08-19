export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fields: string[]
): T {
  const sanitized = { ...obj };
  for (const field of fields) {
    if (typeof sanitized[field] === "string") {
      sanitized[field] = sanitizeText(sanitized[field]);
    }
  }
  return sanitized;
}
