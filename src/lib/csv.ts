// Minimal RFC 4180-compliant CSV generator.
// Escapes commas, quotes, CR/LF by wrapping cells in double quotes
// and doubling any embedded double quotes.

export type CsvCell = string | number | boolean | null | undefined;

function escapeCell(cell: CsvCell): string {
  if (cell == null) return "";
  const s = typeof cell === "string" ? cell : String(cell);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCsv(header: string[], rows: CsvCell[][]): string {
  const lines: string[] = [];
  lines.push(header.map(escapeCell).join(","));
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(","));
  }
  // CRLF line endings per RFC 4180; Excel prefers these.
  return lines.join("\r\n") + "\r\n";
}

export function csvFilename(base: string): string {
  const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 15); // YYYYMMDDTHHMMSS
  return `${base}-${stamp}.csv`;
}
