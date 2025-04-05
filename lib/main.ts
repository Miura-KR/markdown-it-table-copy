import MarkdownIt from "markdown-it";
import Clipboard from "clipboard";

const tableClassName = 'markdown-it-table-copy';
const clipboardBtnClass = `${tableClassName}-btn`;
const tableMdValueAttr = `${tableClassName}-value`;

const	clipboard = new Clipboard(`.markdown-it-table-copy-btn`);
// const	clipboard = new Clipboard(`.${clipboardBtnClass}`, {
//   target: function (trigger) {
//     return trigger.previousElementSibling as Element;
//   },
//   text: function (trigger) {
//     return trigger.getAttribute(tableMdValueAttr) ?? 'value';
//   },
// });

interface MarkdownItTableCopyOptions {
  onSuccess?: (e: ClipboardJS.Event) => void;
  onError?: (e: ClipboardJS.Event) => void;
}

export function markdownitTableCopy(md: MarkdownIt, options: MarkdownItTableCopyOptions) {
  if (clipboard) {
		if (options.onSuccess) {
			clipboard.on("success", options.onSuccess);
		}
		if (options.onError) {
			clipboard.on("error", options.onError);
		}
	}

  // md.renderer.rules.table_open = function (tokens, idx, options, env, self) {
  //   return `<table class=${tableClassName}>`;
  // };

  // 1) Core Rule:
  //    すべての <table> トークンについて、原文（state.src）の対​応部分を抜き出して
  //    table_open トークンに raw-data 属性として保持する
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

  // 2) Render Rule:
  //    table_open / table_close を拡張し、テーブルを <div> で包んでボタン追加する
  // 既存の table_open, table_close のレンダリングルールを退避しておく
  const originalTableOpen = md.renderer.rules.table_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };
  const originalTableClose = md.renderer.rules.table_close ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.table_open = function (tokens, idx, options, env, self) {
    return `<div style="position: relative;">
             ${originalTableOpen(tokens, idx, options, env, self)}`;
  };

  md.renderer.rules.table_close = function (tokens, idx, options, env, self) {
    const buttonHtml = `
             <button class="${clipboardBtnClass}" data-clipboard-target=".${tableMdValueAttr}">
                 ${'Copy'}
             </button>`;
    return `${originalTableClose(tokens, idx, options, env, self)}
      ${buttonHtml}
      </div>`;
  };
}