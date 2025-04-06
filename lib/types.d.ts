export type CopyFormat = 'md' | 'csv';

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
