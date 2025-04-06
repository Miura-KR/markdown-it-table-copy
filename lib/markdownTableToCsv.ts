/**
 * Markdown テーブル → CSV 変換
 * @param mdStr  マークダウン表の文字列
 * @returns   CSV 文字列
 */
export function markdownTableToCsv(mdStr: string): string {
  // 1. 行単位に分割して前後の空白を除去
  const lines: string[] = mdStr.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const bodyRows: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    // 2. 2 行目に現れる区切り線（--- や :---: など）をスキップ
    if (i === 1 && /^[:\-\| ]+$/.test(lines[i])) continue;
    bodyRows.push(lines[i]);
  }

  // 3. 各行を CSV に変換
  return bodyRows
    .map(row => {
      // 先頭/末尾のパイプを除き、セルごとに分割
      const cells: string[] = row.replace(/^\||\|$/g, '').split('|').map(c => c.trim());

      // RFC 4180 に準拠したエスケープ
      return cells
        .map(cell => {
          const escaped = cell.replace(/"/g, '""');
          return /[,"\r\n]/.test(cell) ? `"${escaped}"` : escaped;
        })
        .join(',');
    })
    .join('\n');
}
