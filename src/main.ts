import markdownit from 'markdown-it'
import { markdownitTableCopy } from '../lib/main'
import { MarkdownItTableCopyOptions } from "../lib/types"
import './style.css'
import '@mdi/font/css/materialdesignicons.min.css'

const tableMdText = `
# Markdown Table

First table

| 名前 | 年齢 | 趣味      |
|------|------|-----------|
| 田中 | 28   | サッカー  |
| 鈴木 | 35   | 読書      |
| 佐藤 | 22   | ギター    |

Second table

| 名前1 | 年齢 | 趣味      |
|------|------|-----------|
| 田中 | 28   | サッカー  |
| 鈴木 | 35   | 読書      |
| 佐藤 | 22   | ギター    |
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

