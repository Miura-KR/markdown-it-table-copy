import { describe, it, expect } from 'vitest';
import { markdownTableToCsv } from '../lib/markdownTableToCsv';

describe('markdownTableToCsv', () => {
  const testCases = [
    {
      name: 'should convert a basic markdown table to CSV',
      markdown: `
      | Header 1 | Header 2 | Header 3 |
      | -------- | -------- | -------- |
      | Value 1  | Value 2  | Value 3  |
      | Value 4  | Value 5  | Value 6  |
    `,
      expected:
        'Header 1,Header 2,Header 3\n' +
        'Value 1,Value 2,Value 3\n' +
        'Value 4,Value 5,Value 6'
    },
    {
      name: 'should handle tables with different alignment markers',
      markdown: `
      | Left | Center | Right |
      | :--- | :----: | ----: |
      | 1    | 2      | 3     |
    `,
      expected:
        'Left,Center,Right\n' +
        '1,2,3'
    },
    {
      name: 'should properly escape cells with commas',
      markdown: `
      | Item | Description |
      | ---- | ----------- |
      | Item 1 | First item, very important |
      | Item 2 | Second item |
    `,
      expected:
        'Item,Description\n' +
        'Item 1,"First item, very important"\n' +
        'Item 2,Second item'
    },
    {
      name: 'should properly escape cells with quotes',
      markdown: `
      | Quote | Author |
      | ----- | ------ |
      | "To be or not to be" | Shakespeare |
      | Simple | No quotes |
    `,
      expected:
        'Quote,Author\n' +
        '"""To be or not to be""",Shakespeare\n' +
        'Simple,No quotes'
    },
    {
      name: 'should handle cells with newlines',
      markdown: `
      | Item | Description |
      | ---- | ----------- |
      | Item 1 | Line 1
Line 2 |
      | Item 2 | Single line |
    `,
      expected:
        'Item,Description\n' +
        'Item 1,Line 1\n' +
        'Line 2\n' +
        'Item 2,Single line'
    },
    {
      name: 'should handle empty cells',
      markdown: `
      | A | B | C |
      | - | - | - |
      | 1 |   | 3 |
      |   | 2 |   |
    `,
      expected:
        'A,B,C\n' +
        '1,,3\n' +
        ',2,'
    },
    {
      name: 'should handle single-row tables',
      markdown: `| Single | Row | Table |`,
      expected: 'Single,Row,Table'
    },
    {
      name: 'should handle single-column tables',
      markdown: `
      | Column |
      | ------ |
      | Value 1 |
      | Value 2 |
    `,
      expected:
        'Column\n' +
        'Value 1\n' +
        'Value 2'
    },
    {
      name: 'should handle tables without leading/trailing pipes',
      markdown: `
      Header 1 | Header 2 | Header 3
      -------- | -------- | --------
      Value 1  | Value 2  | Value 3
    `,
      expected:
        'Header 1,Header 2,Header 3\n' +
        'Value 1,Value 2,Value 3'
    },
    {
      name: 'should handle complex escaping scenarios',
      markdown: `
      | Complex | Data |
      | ------- | ---- |
      | "Quoted, with comma" | Line 1
Line "2" |
      | Normal | Cell |
    `,
      expected:
        'Complex,Data\n' +
        '"""Quoted, with comma""",Line 1\n' +
        '"Line ""2"""\n' +
        'Normal,Cell'
    }
  ];

  it.each(testCases)('$name', ({ markdown, expected }) => {
    expect(markdownTableToCsv(markdown)).toBe(expected);
  });
});
