import markdownit from 'markdown-it'
// import { markdownitTableCopy, MarkdownItTableCopyOptions } from '../dist/markdown-it-table-copy.js'
import { markdownitTableCopy } from '../lib/main'
import { MarkdownItTableCopyOptions } from "../lib/types"
import './style.css'
import '@mdi/font/css/materialdesignicons.min.css'

const tableMdText = `
# Markdown Table Copy

First table

| 名前 | 年齢 | 趣味      |
|------|------|-----------|
| 田中 | 28   | サッカー  |
| 鈴木 | 35   | 読書      |
| 佐藤 | 22   | ギター    |

Second table

| Item | Description |
| ---- | ----------- |
| Item 1 | Line 1 |
| Item 2 | Single line |
`

const md = markdownit()
md.use(markdownitTableCopy, {
  mdCopyElement: '<span class="mdi mdi-language-markdown-outline"></span>',
  csvCopyElement: '<span class="mdi mdi-file-delimited-outline"></span>',
} as MarkdownItTableCopyOptions);

const rendered = md.render(tableMdText);

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    ${rendered}
  </div>
`

