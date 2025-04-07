import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MarkdownIt from 'markdown-it';
import { markdownitTableCopy,  } from '../lib';
import { MarkdownItTableCopyOptions } from '../lib/types';

describe('markdownitTableCopy', () => {
  let md: MarkdownIt;
  const sampleTable = `
| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Value 1  | Value 2  | Value 3  |
| Value 4  | Value 5  | Value 6  |
`;

  beforeEach(() => {
    // 各テスト前にMarkdownItインスタンスを初期化
    md = new MarkdownIt();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should register the plugin with default options', () => {
    // プラグインを登録
    md.use(markdownitTableCopy);

    // プラグインが登録されていることを確認（レンダリングが正常に行われるか）
    const rendered = md.render('| test |\n| ---- |');
    expect(rendered).toContain('markdown-it-table-copy');
  });

  it('should render table with container and buttons', () => {
    md.use(markdownitTableCopy);

    const rendered = md.render(sampleTable);

    // コンテナが追加されていることを確認
    expect(rendered).toContain('<div style="display: grid; grid-template: auto;" class="markdown-it-table-copy">');

    // テーブルにマークダウンソースが追加されていることを確認
    expect(rendered).toContain(`<table markdown-it-table-copy-value="${sampleTable.trim()}">`);

    // ボタンが追加されていることを確認
    expect(rendered).toContain('<div style="justify-self: end; align-self: end;" class="markdown-it-table-copy-buttons">');
    expect(rendered).toContain('<button class="markdown-it-table-copy-btn" style="cursor: pointer;" markdown-it-table-copy-format="md">');
    expect(rendered).toContain('<button class="markdown-it-table-copy-btn" style="cursor: pointer;" markdown-it-table-copy-format="csv">');
  });

  it('should apply custom options', () => {
    const options: MarkdownItTableCopyOptions = {
      copyMd: true,
      copyCsv: true,
      tableContainerStyle: 'custom-container-style',
      tableContainerClass: 'custom-container-class',
      btnContainerStyle: 'custom-button-container-style',
      btnContainerClass: 'custom-button-container-class',
      btnStyle: 'custom-button-style',
      btnClass: 'custom-button-class',
      mdCopyBtnElement: '<span>Copy MD</span>',
      csvCopyBtnElement: '<span>Copy CSV</span>'
    };

    md.use(markdownitTableCopy, options);

    const rendered = md.render(sampleTable);

    // カスタムスタイルとクラスが適用されていることを確認
    expect(rendered).toContain(`style="custom-container-style"`);
    expect(rendered).toContain(`class="markdown-it-table-copy custom-container-class"`);
    expect(rendered).toContain(`style="custom-button-container-style"`);
    expect(rendered).toContain(`class="markdown-it-table-copy-buttons custom-button-container-class"`);
    expect(rendered).toContain(`style="custom-button-style"`);
    expect(rendered).toContain(`class="markdown-it-table-copy-btn custom-button-class"`);

    // カスタムボタン要素が適用されていることを確認
    expect(rendered).toContain('<span>Copy MD</span>');
    expect(rendered).toContain('<span>Copy CSV</span>');
  });

  it('should only render md button when copyCsv is false', () => {
    md.use(markdownitTableCopy, {
      copyMd: true,
      copyCsv: false
    });

    const rendered = md.render(sampleTable);

    // mdボタンのみが存在することを確認
    expect(rendered).toContain('markdown-it-table-copy-format="md"');
    expect(rendered).not.toContain('markdown-it-table-copy-format="csv"');
  });

  it('should only render csv button when copyMd is false', () => {
    md.use(markdownitTableCopy, {
      copyMd: false,
      copyCsv: true
    });

    const rendered = md.render(sampleTable);

    // csvボタンのみが存在することを確認
    expect(rendered).not.toContain('markdown-it-table-copy-format="md"');
    expect(rendered).toContain('markdown-it-table-copy-format="csv"');
  });
});
