import markdownit from 'markdown-it'
import { markdownitTableCopy } from '../lib/main'
import './style.css'

const tableMdText =
  `| 名前 | 年齢 | 趣味      |
  |------|------|-----------|
  | 田中 | 28   | サッカー  |
  | 鈴木 | 35   | 読書      |
  | 佐藤 | 22   | ギター    |
  `
const md = markdownit()
md.use(markdownitTableCopy, {});
const rendered = md.render(tableMdText);

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    ${rendered}
  </div>
`

