import MarkdownIt from "markdown-it";
import Clipboard from "clipboard";
import { markdownTableToCsv } from "./markdownTableToCsv";
import { CopyFormat, MarkdownItTableCopyOptions } from "./types";

// 型定義ファイル出力のため再エクスポート
export * from './types'

const containerClassName = 'markdown-it-table-copy';
const btnContainerClassName = `${containerClassName}-buttons`;
const copyBtnClassName = `${containerClassName}-btn`;
const tableMdValueAttr = `${containerClassName}-value`;
const copyFormatAttr = `${containerClassName}-format`;

const clipboard = new Clipboard(`.${copyBtnClassName}`, {
  text: function (trigger) {
    const table = trigger.closest(`.${containerClassName}`)?.querySelector(`table[${tableMdValueAttr}]`);
    const mdText = table?.getAttribute(tableMdValueAttr) ?? 'not found';
    const copyFormat = trigger.getAttribute(copyFormatAttr) as CopyFormat;

    return copyFormat === 'csv' ? markdownTableToCsv(mdText) : mdText;
  },
});

const defaultOptions: MarkdownItTableCopyOptions = {
  copyMd: true,
  copyCsv: true,
  tableContainerStyle: 'display: grid; grid-template: auto;',
  tableContainerClass: '',
  btnContainerStyle: 'justify-self: end; align-self: end;',
  btnContainerClass: '',
  btnStyle: 'cursor: pointer;',
  btnClass: '',
  mdCopyBtnElement: '<span>md</span>',
  csvCopyBtnElement: '<span>csv</span>'
};

export function markdownitTableCopy(md: MarkdownIt, options: MarkdownItTableCopyOptions) {
  options = {
    ...defaultOptions,
    ...options,
  };

  if (options.onSuccess) {
    clipboard.on("success", options.onSuccess);
  }
  if (options.onError) {
    clipboard.on("error", options.onError);
  }

  md.core.ruler.push('table_source_extractor', function (state) {
    const tokens = state.tokens;

    const tokenTypeOpen = 'table_open';
    const tokenTypeClose = 'table_close';

    const table_tokens = tokens.filter((token) => [tokenTypeOpen, tokenTypeClose].includes(token.type));
    table_tokens
      // open, closeが閉じている要素に絞り込み
      .filter((token, idx) => token.type === tokenTypeOpen
        && table_tokens.length > idx + 1
        && table_tokens[idx + 1].type === tokenTypeClose)
      .filter((openToken) => openToken.map)
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
  const originalTableOpen = md.renderer.rules.table_open ??
    function (tokens, idx, options, _env, self) {
      return self.renderToken(tokens, idx, options);
    };
  const originalTableClose = md.renderer.rules.table_close ??
    function (tokens, idx, options, _env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.table_open = function (tokens, idx, markdownIdOptions, env, self) {
    let containerClasses = containerClassName;
    if (options.tableContainerClass) {
      containerClasses += ` ${options.tableContainerClass}`;
    }

    const style = options.tableContainerStyle ? `style="${options.tableContainerStyle}"` : '';
    return `<div ${style} class="${containerClasses}">
             ${originalTableOpen(tokens, idx, markdownIdOptions, env, self)}`;
  };

  md.renderer.rules.table_close = function (tokens, idx, markdownItOptions, env, self) {
    let buttonClasses = copyBtnClassName;
    if (options.btnClass) {
      buttonClasses += ` ${options.btnClass}`;
    }
    const btnStyle = options.btnStyle ? `style="${options.btnStyle}"` : '';
    const mdCopyBtnHtml = options.copyMd ? `
             <button class="${buttonClasses}" ${btnStyle} ${copyFormatAttr}="md">
                 ${options.mdCopyBtnElement ?? ''}
             </button>` : '';
    const csvCopyBtnHtml = options.copyCsv ? `
             <button class="${buttonClasses}" ${btnStyle} ${copyFormatAttr}="csv">
                 ${options.csvCopyBtnElement ?? ''}
             </button>` : '';

    let buttonContainerClasses = btnContainerClassName;
    if (options.btnContainerClass) {
      buttonContainerClasses += ` ${options.btnContainerClass}`;
    }

    const containerStyle = options.btnContainerStyle ? `style="${options.btnContainerStyle}"` : '';
    return `${originalTableClose(tokens, idx, markdownItOptions, env, self)}
        <div ${containerStyle} class="${buttonContainerClasses}">
          ${mdCopyBtnHtml}${csvCopyBtnHtml}
        </div>
      </div>`;
  };
}
