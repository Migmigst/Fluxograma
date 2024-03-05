// @ts-ignore: JISON doesn't support types
import contextMapParser from './parser/contextMap.jison';
import * as contextMapDb from './contextMapDb.js';
import contextMapRenderer from './contextMapRenderer.js';

export const diagram = {
  db: contextMapDb,
  renderer: contextMapRenderer,
  parser: contextMapParser,
  styles: undefined,
};
