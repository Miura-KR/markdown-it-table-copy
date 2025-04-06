import { describe, it, expect } from 'vitest';
import { markdownTableToCsv } from '../lib/markdownTableToCsv';

describe('markdownTableToCsv', () => {
    it('should convert a basic markdown table to CSV', () => {
        const markdown = `
      | Header 1 | Header 2 | Header 3 |
      | -------- | -------- | -------- |
      | Value 1  | Value 2  | Value 3  |
      | Value 4  | Value 5  | Value 6  |
    `;

        const expected =
            'Header 1,Header 2,Header 3\n' +
            'Value 1,Value 2,Value 3\n' +
            'Value 4,Value 5,Value 6';

        expect(markdownTableToCsv(markdown)).toBe(expected);
    });

    it('should handle tables with different alignment markers', () => {
        const markdown = `
      | Left | Center | Right |
      | :--- | :----: | ----: |
      | 1    | 2      | 3     |
    `;

        const expected =
            'Left,Center,Right\n' +
            '1,2,3';

        expect(markdownTableToCsv(markdown)).toBe(expected);
    });

    it('should properly escape cells with commas', () => {
        const markdown = `
      | Item | Description |
      | ---- | ----------- |
      | Item 1 | First item, very important |
      | Item 2 | Second item |
    `;

        const expected =
            'Item,Description\n' +
            'Item 1,"First item, very important"\n' +
            'Item 2,Second item';

        expect(markdownTableToCsv(markdown)).toBe(expected);
    });

    it('should properly escape cells with quotes', () => {
        const markdown = `
      | Quote | Author |
      | ----- | ------ |
      | "To be or not to be" | Shakespeare |
      | Simple | No quotes |
    `;

        const expected =
            'Quote,Author\n' +
            '"""To be or not to be""",Shakespeare\n' +
            'Simple,No quotes';

        expect(markdownTableToCsv(markdown)).toBe(expected);
    });

    it('should handle cells with newlines', () => {
        const markdown = `
      | Item | Description |
      | ---- | ----------- |
      | Item 1 | Line 1
Line 2 |
      | Item 2 | Single line |
    `;

        const expected =
            'Item,Description\n' +
            'Item 1,Line 1\n' +
            'Line 2\n' +
            'Item 2,Single line';

        expect(markdownTableToCsv(markdown)).toBe(expected);
    });

    it('should handle empty cells', () => {
        const markdown = `
      | A | B | C |
      | - | - | - |
      | 1 |   | 3 |
      |   | 2 |   |
    `;

        const expected =
            'A,B,C\n' +
            '1,,3\n' +
            ',2,';

        expect(markdownTableToCsv(markdown)).toBe(expected);
    });

    it('should handle single-row tables', () => {
        const markdown = `| Single | Row | Table |`;

        const expected = 'Single,Row,Table';

        expect(markdownTableToCsv(markdown)).toBe(expected);
    });

    it('should handle single-column tables', () => {
        const markdown = `
      | Column |
      | ------ |
      | Value 1 |
      | Value 2 |
    `;

        const expected =
            'Column\n' +
            'Value 1\n' +
            'Value 2';

        expect(markdownTableToCsv(markdown)).toBe(expected);
    });

    it('should handle tables without leading/trailing pipes', () => {
        const markdown = `
      Header 1 | Header 2 | Header 3
      -------- | -------- | --------
      Value 1  | Value 2  | Value 3
    `;

        const expected =
            'Header 1,Header 2,Header 3\n' +
            'Value 1,Value 2,Value 3';

        expect(markdownTableToCsv(markdown)).toBe(expected);
    });

    it('should handle complex escaping scenarios', () => {
        const markdown = `
      | Complex | Data |
      | ------- | ---- |
      | "Quoted, with comma" | Line 1
Line "2" |
      | Normal | Cell |
    `;

        const expected =
            'Complex,Data\n' +
            '"""Quoted, with comma""",Line 1\n' +
            '"Line ""2"""\n' +
            'Normal,Cell';

        expect(markdownTableToCsv(markdown)).toBe(expected);
    });
});
