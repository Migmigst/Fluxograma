import { describe, expect, it } from 'vitest';
import { Info } from '../../src/language/index.js';
import { createTestServices } from '../test-utils.js';
import { ParseResult } from 'langium';

describe('info', () => {
  const { parse } = createTestServices<Info>();

  it.each([
    `info`,
    `
    info`,
    `info
    `,
    `

    info

    `,
  ])('should handle empty info', (context: string) => {
    const result: ParseResult<Info> = parse(context);
    expect(result.parserErrors).toHaveLength(0);
    expect(result.lexerErrors).toHaveLength(0);

    const value: Info = result.value;
    expect(value.$type).toBe(Info);
  });
});
