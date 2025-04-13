/**
 * Convert Markdown table to CSV
 * @param mdStr  Markdown table string
 * @returns   CSV string
 */
export function markdownTableToCsv(mdStr: string): string {
  // 1. Split by line and remove whitespace before and after
  const lines: string[] = mdStr.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const bodyRows: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    // 2. Skip the separator line (---, :---:, etc.) that appears on the second line
    if (i === 1 && /^[:\-| ]+$/.test(lines[i])) continue;
    bodyRows.push(lines[i]);
  }

  // 3. Convert each row to CSV
  return bodyRows
    .map(row => {
      // Remove leading/trailing pipes and split by cell
      const cells: string[] = row.replace(/^\||\|$/g, '').split('|').map(c => c.trim());

      // RFC4180-compliant escaping
      return cells
        .map(cell => {
          const escaped = cell.replace(/"/g, '""');
          return /[,"\r\n]/.test(cell) ? `"${escaped}"` : escaped;
        })
        .join(',');
    })
    .join('\n');
}
