export type CopyFormat = 'md' | 'csv';

export interface MarkdownItTableCopyOptions {
  onSuccess?: (e: ClipboardJS.Event) => void;
  onError?: (e: ClipboardJS.Event) => void;
  copyMd?: boolean;
  copyCsv?: boolean;
  tableContainerStyle?: string;
  tableContainerClass?: string;
  btnContainerStyle?: string;
  btnContainerClass?: string;
  btnStyle?: string;
  btnClass?: string;
  mdCopyBtnElement?: string;
  csvCopyBtnElement?: string;
}
