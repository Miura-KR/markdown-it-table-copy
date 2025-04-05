import MarkdownIt from "markdown-it";
import Clipboard from "clipboard";

export interface MarkdownItTableCopyOptions {
  onSuccess?: (e: ClipboardJS.Event) => void;
  onError?: (e: ClipboardJS.Event) => void;
  copyMd?: boolean;
  copyCsv?: boolean;
	containerStyle?: string;
	containerClass?: string;
	buttonStyle?: string;
	buttonClass?: string;
  element?: string;
}

const tableClassName = 'markdown-it-table-copy';
const clipboardBtnClass = `${tableClassName}-btn`;
const tableMdValueAttr = `${tableClassName}-value`;

const	clipboard = new Clipboard(`.${clipboardBtnClass}`, {
  text: function (trigger) {
    const table = trigger.parentElement?.querySelector(`table[${tableMdValueAttr}]`);
    return table?.getAttribute(tableMdValueAttr) ?? 'not found';
  },
});

const defaultOptions: MarkdownItTableCopyOptions = {
	containerStyle: 'display: grid; grid-template: auto;',
	containerClass: '',
	buttonStyle: 'justify-self: end; align-self: end; cursor: pointer;',
	// buttonStyle: 'all: unset; position: absolute; button: -10px; right: 6px;  outline: none; hight: 30px;',
	buttonClass: '',
  element: '<span>md</span>'
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

  md.renderer.rules.table_open = function (tokens, idx, mdIdOptions, env, self) {
    return `<div style="${options.containerStyle}" class="${options.containerClass}">
             ${originalTableOpen(tokens, idx, mdIdOptions, env, self)}`;
  };

  md.renderer.rules.table_close = function (tokens, idx, mdItOptions, env, self) {
    const buttonHtml = `
             <button class="${clipboardBtnClass} ${options.buttonClass}" style="${options.buttonStyle}">
                 ${options.element}
             </button>`;
    return `${originalTableClose(tokens, idx, mdItOptions, env, self)}
      ${buttonHtml}
      </div>`;
  };
}