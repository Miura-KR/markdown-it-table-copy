import MarkdownIt from "markdown-it";
import Clipboard from "clipboard";

type CopyFormat = 'md' | 'csv';

export interface MarkdownItTableCopyOptions {
  onSuccess?: (e: ClipboardJS.Event) => void;
  onError?: (e: ClipboardJS.Event) => void;
  copyMd?: boolean;
  copyCsv?: boolean;
	tableContainerStyle?: string;
	tableContainerClass?: string;
	buttonContainerStyle?: string;
	buttonContainerClass?: string;
	buttonStyle?: string;
	buttonClass?: string;
  mdCopyElement?: string;
  csvCopyElement?: string;
}

const containerClassName = 'markdown-it-table-copy';
const btnContainerClassName = `${containerClassName}-buttons`;
const clipboardBtnClassName = `${containerClassName}-btn`;
const tableMdValueAttr = `${containerClassName}-value`;
const copyFormatAttr = `${containerClassName}-format`;

const	clipboard = new Clipboard(`.${clipboardBtnClassName}`, {
  text: function (trigger) {
    const table = trigger.closest(`.${containerClassName}`)?.querySelector(`table[${tableMdValueAttr}]`);
    const mdText = table?.getAttribute(tableMdValueAttr) ?? 'not found';
    const copyFormat = trigger.getAttribute(copyFormatAttr) as CopyFormat;

    return copyFormat === 'csv' ? markdownTableToCsv(mdText) : mdText;
  },
});

/**
 * Markdown テーブル → CSV 変換
 * @param mdStr  マークダウン表の文字列
 * @returns   CSV 文字列
 */
function markdownTableToCsv(mdStr: string): string {
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


const defaultOptions: MarkdownItTableCopyOptions = {
  copyMd: true,
  copyCsv: true,
	tableContainerStyle: 'display: grid; grid-template: auto;',
	tableContainerClass: '',
	buttonContainerStyle: 'justify-self: end; align-self: end;',
	buttonContainerClass: '',
	buttonStyle: 'cursor: pointer;',
	buttonClass: '',
  mdCopyElement: '<span>md</span>',
  csvCopyElement: '<span>csv</span>'
};

export function markdownitTableCopy(md: MarkdownIt, options: MarkdownItTableCopyOptions) {
  options = {
    ...defaultOptions,
    ...options,
  };

  if (clipboard) {
		if (options.onSuccess) {
			clipboard.on("success", options.onSuccess);
		}
		if (options.onError) {
			clipboard.on("error", options.onError);
		}
	}

  md.core.ruler.push('table_source_extractor', function (state) {
    const tokens = state.tokens;

    const tokenTypeOpen = 'table_open';
    const tokenTypeClose = 'table_close';

    const table_tokens = tokens.filter((token) => [tokenTypeOpen, tokenTypeClose].includes(token.type))
    table_tokens
      // open, closeが閉じている要素に絞り込み
      .filter((token, idx) => token.type === tokenTypeOpen
        && table_tokens.length > idx + 1
        && table_tokens[idx + 1].type === tokenTypeClose)
      .filter((openToken) => openToken.map && openToken.map.length > 0)
      .forEach((openToken) => {
        if (!openToken.map) return;
        // トークンが持つ map は [開始行, 終了行+1] の配列
        // table_open と table_close の行範囲を使って原文から抜き出す
        const startLine = openToken.map[0];
        const endLine = openToken.map[1];

        const lines = state.src.split(/\r?\n/).slice(startLine, endLine);
        const rawTableMarkdown = lines.join('\n');

        openToken.attrPush([tableMdValueAttr, rawTableMarkdown]);
      })
  });

  // 既存の table_open, table_close のレンダリングルールを退避しておく
  const originalTableOpen = md.renderer.rules.table_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };
  const originalTableClose = md.renderer.rules.table_close ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.table_open = function (tokens, idx, markdownIdOptions, env, self) {
    return `<div style="${options.tableContainerStyle}" class="${containerClassName} ${options.tableContainerClass}">
             ${originalTableOpen(tokens, idx, markdownIdOptions, env, self)}`;
  };

  md.renderer.rules.table_close = function (tokens, idx, markdownItOptions, env, self) {
    const mdCopyBtnHtml = options.copyMd ? `
             <button class="${clipboardBtnClassName} ${options.buttonClass}" style="${options.buttonStyle}" ${copyFormatAttr}="md">
                 ${options.mdCopyElement}
             </button>` : '';
    const csvCopyBtnHtml = options.copyCsv ? `
             <button class="${clipboardBtnClassName} ${options.buttonClass}" style="${options.buttonStyle}" ${copyFormatAttr}="csv">
                 ${options.csvCopyElement}
             </button>` : '';
    return `${originalTableClose(tokens, idx, markdownItOptions, env, self)}
        <div style="${options.buttonContainerStyle}" class="${btnContainerClassName} ${options.buttonContainerClass}">
          ${mdCopyBtnHtml}${csvCopyBtnHtml}
        </div>
      </div>`;
  };
}