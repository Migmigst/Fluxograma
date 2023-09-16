// import type { RailroadDB } from './railroadTypes.js';
import * as configApi from '../../config.js';
import type { DiagramDB } from '../../diagram-api/types.js';

import { clear as commonClear } from '../common/commonDb.js';

const clear = (): void => {
  commonClear();

  rules = {};
};

// TODO: move to style config
// Styles
//
// unite rules
// split rules
//
// show states / display states
// hide states
//
// shapes of non-terminals
// shapes of terminals
//
// start
// end

// mark empty transitions
// true / false

// empty transitions mark ?
// 𝜺 - epsilon
// ɛ
// null
// type ruleID = string;

export type Rules = Record<string, Chunk>;

let rules: Rules = {};

const getConsole = () => console;

type Callback<T> = (item: Chunk, index: number, parent: Chunk | undefined, result: T[]) => T;
// type Traverse<T> = (callback: Callback<T>, index: number, parent?: Chunk) => T;

interface Traversible {
  traverse<T>(callback: Callback<T>, index?: number, parent?: Chunk): T;
}

// TODO: rewrite toString using traverse
//
interface Chunk extends Traversible {
  toString(): string;
}

class Leaf implements Chunk {
  constructor(public label: string) {}

  traverse<T>(callback: Callback<T>, index?: number, parent?: Chunk): T {
    index ??= 0;
    return callback(this, index, parent, []);
  }

  toString(): string {
    return this.label;
  }
}

class Node implements Chunk {
  constructor(public child: Chunk) {}

  traverse<T>(callback: Callback<T>, index?: number, parent?: Chunk): T {
    index ??= 0;
    const nested = this.child.traverse(callback, index, this);

    return callback(this, index, parent, [nested]);
  }
}

class Chain implements Chunk {
  constructor(public children: Chunk[]) {}

  traverse<T>(callback: Callback<T>, index?: number, parent?: Chunk): T {
    index ??= 0;
    const nested = this.children.map((child, child_index) =>
      child.traverse(callback, child_index, this)
    );

    return callback(this, index, parent, nested);
  }
}

class Rule {
  constructor(public ID: string, public definition: Chunk) {}
}

// Epsilon represents empty transition
//
// It is implied that every chunk has `start` and `end` states
// But we do not create them, simply keeping transition 'body' with label
//
class Epsilon extends Leaf {
  constructor() {
    super('ɛ');
  }
}

// remote quote???
class Term extends Leaf {
  constructor(public label: string, public quote: string) {
    super(label);
  }

  toString(): string {
    return this.quote + super.toString() + this.quote;
  }
}

class NonTerm extends Leaf {
  toString(): string {
    return '<' + super.toString() + '>';
  }
}

class Choice extends Chain {
  toString(): string {
    const content = this.children.map((c) => c.toString()).join('|');
    return '(' + content + ')';
  }
}

class Sequence extends Chain {
  toString(): string {
    const content = this.children.map((c) => c.toString()).join(',');
    return '[' + content + ']';
  }
}

class OneOrMany extends Node {
  toString(): string {
    return this.child.toString() + '+';
  }
}

class ZeroOrOne extends Node {
  toString(): string {
    return this.child.toString() + '?';
  }
}

class ZeroOrMany extends Node {
  toString(): string {
    return this.child.toString() + '*';
  }
}

const addTerm = (label: string, quote: string): Chunk => {
  return new Term(label, quote);
};
const addNonTerm = (label: string): Chunk => {
  return new NonTerm(label);
};

const addZeroOrOne = (chunk: Chunk): Chunk => {
  return new ZeroOrOne(chunk);
};
const addOneOrMany = (chunk: Chunk): Chunk => {
  return new OneOrMany(chunk);
};
const addZeroOrMany = (chunk: Chunk): Chunk => {
  return new ZeroOrMany(chunk);
};
const addRuleOrChoice = (ID: string, chunk: Chunk): void => {
  if (rules[ID]) {
    const value = rules[ID];
    const alternative = addChoice([value, chunk]);
    rules[ID] = alternative;
  } else {
    rules[ID] = chunk;
  }
};

const addSequence = (chunks: Chunk[]): Chunk => {
  if (!Array.isArray(chunks)) {
    console.error('Sequence`s chunks are not array', chunks);
  }

  if (configApi.getConfig().railroad?.compress) {
    chunks = chunks
      .map((chunk) => {
        if (chunk instanceof Sequence) {
          return chunk.children;
        }
        return chunk;
      })
      .flat();
  }

  if (chunks.length === 1) {
    return chunks[0];
  } else {
    return new Sequence(chunks);
  }
};

const addChoice = (chunks: Chunk[]): Chunk => {
  if (!Array.isArray(chunks)) {
    console.error('Alternative chunks are not array', chunks);
  }

  if (configApi.getConfig().railroad?.compress) {
    chunks = chunks
      .map((chunk) => {
        if (chunk instanceof Choice) {
          return chunk.children;
        }
        return chunk;
      })
      .flat();
  }

  if (chunks.length === 1) {
    return chunks[0];
  } else {
    return new Choice(chunks);
  }
};

const addEpsilon = (): Chunk => {
  return new Epsilon();
};

const getRules = (): Rule[] => {
  return Object.entries(rules).map(([ID, definition]) => new Rule(ID, definition))
};

export interface RailroadDB extends DiagramDB {
  addChoice: (chunks: Chunk[]) => Chunk;
  addEpsilon: () => Chunk;
  addNonTerm: (label: string) => Chunk;
  addOneOrMany: (chunk: Chunk) => Chunk;
  addRuleOrChoice: (ID: string, chunk: Chunk) => void;
  addSequence: (chunks: Chunk[]) => Chunk;
  addTerm: (label: string, quote: string) => Chunk;
  addZeroOrMany: (chunk: Chunk) => Chunk;
  addZeroOrOne: (chunk: Chunk) => Chunk;
  clear: () => void;
  getConsole: () => Console;
  getRules: () => Rule[];
}

export const db: RailroadDB = {
  addChoice,
  addEpsilon,
  addNonTerm,
  addOneOrMany,
  addRuleOrChoice,
  addSequence,
  addTerm,
  addZeroOrMany,
  addZeroOrOne,
  clear,
  getConfig: () => configApi.getConfig().railroad,
  getConsole,
  getRules,
};
