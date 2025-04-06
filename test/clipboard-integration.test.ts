import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MarkdownIt from 'markdown-it';
import { markdownitTableCopy } from '../lib/main';
import { markdownTableToCsv } from '../lib/markdownTableToCsv';

// グローバル型定義の拡張
declare global {
  var clipboardTextCallback: ((trigger: HTMLElement) => string) | null;
}

// ClipboardJSの実際の動作をテストするためのモック
vi.mock('clipboard', () => {
  // グローバル変数として設定
  global.clipboardTextCallback = null;
  
  const ClipboardMock = vi.fn().mockImplementation((selector, options) => {
    global.clipboardTextCallback = options.text;
    return {
      on: vi.fn(),
      destroy: vi.fn()
    };
  });
  
  return { default: ClipboardMock };
});

// markdownTableToCsvのモック
vi.mock('../lib/markdownTableToCsv', () => ({
  markdownTableToCsv: vi.fn((mdText) => `CSV_CONVERTED:${mdText}`)
}));

describe('Clipboard Integration', () => {
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
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should copy markdown text when md button is clicked', () => {
    md.use(markdownitTableCopy, {});
    
    // レンダリングしてDOMに追加
    const rendered = md.render(sampleTable);
    document.body.innerHTML = rendered;
    
    // ClipboardJSのコールバック関数を取得
    const textCallback = global.clipboardTextCallback;
    expect(textCallback).not.toBeNull();
    
    // mdボタンを取得
    const mdButton = document.querySelector('[markdown-it-table-copy-format="md"]') as HTMLElement;
    expect(mdButton).not.toBeNull();
    
    // テーブルコンテナを取得
    const tableContainer = document.querySelector('.markdown-it-table-copy') as HTMLElement;
    expect(tableContainer).not.toBeNull();
    
    // ボタンクリックをシミュレート
    mdButton.closest = vi.fn().mockReturnValue(tableContainer);
    
    // コールバック関数を実行（nullでないことを確認済み）
    const result = textCallback!(mdButton);
    
    // マークダウン形式でコピーされることを確認
    expect(result).toContain('Header 1');
    expect(result).toContain('Value 1');
    expect(markdownTableToCsv).not.toHaveBeenCalled();
  });

  it('should copy CSV text when csv button is clicked', () => {
    md.use(markdownitTableCopy, {});
    
    // レンダリングしてDOMに追加
    const rendered = md.render(sampleTable);
    document.body.innerHTML = rendered;
    
    // ClipboardJSのコールバック関数を取得
    const textCallback = global.clipboardTextCallback;
    expect(textCallback).not.toBeNull();
    
    // csvボタンを取得
    const csvButton = document.querySelector('[markdown-it-table-copy-format="csv"]') as HTMLElement;
    expect(csvButton).not.toBeNull();
    
    // テーブルコンテナを取得
    const tableContainer = document.querySelector('.markdown-it-table-copy') as HTMLElement;
    expect(tableContainer).not.toBeNull();
    
    // ボタンクリックをシミュレート
    csvButton.closest = vi.fn().mockReturnValue(tableContainer);
    
    // コールバック関数を実行（nullでないことを確認済み）
    const result = textCallback!(csvButton);
    
    // CSV形式に変換されることを確認
    expect(result).toContain('CSV_CONVERTED:');
    expect(markdownTableToCsv).toHaveBeenCalled();
  });

  it('should handle case when table is not found', () => {
    md.use(markdownitTableCopy, {});
    
    // レンダリングしてDOMに追加
    const rendered = md.render(sampleTable);
    document.body.innerHTML = rendered;
    
    // ClipboardJSのコールバック関数を取得
    const textCallback = global.clipboardTextCallback;
    expect(textCallback).not.toBeNull();
    
    // mdボタンを取得
    const mdButton = document.querySelector('[markdown-it-table-copy-format="md"]') as HTMLElement;
    expect(mdButton).not.toBeNull();
    
    // テーブルが見つからない場合をシミュレート
    mdButton.closest = vi.fn().mockReturnValue(null);
    
    // コールバック関数を実行（nullでないことを確認済み）
    const result = textCallback!(mdButton);
    
    // エラーメッセージが返されることを確認
    expect(result).toBe('not found');
  });
});
