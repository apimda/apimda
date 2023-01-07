import * as path from 'path';
import { getTsConfig, groupBy, toRecord } from './utils';

class Person {
  constructor(public first: string, public last: string) {}
}

describe('groupBy tests', () => {
  test('empty array', () => {
    const grouped = groupBy([], i => i);
    expect(grouped).toStrictEqual({});
  });
  test('normal usage', () => {
    const joe = new Person('Joe', 'Mays');
    const jeff = new Person('Jeff', 'Mays');
    const sahin = new Person('Sahin', 'Vardar');
    const people = [joe, jeff, sahin];
    const grouped = groupBy(people, p => p.last);
    expect(grouped).toStrictEqual({
      Mays: [joe, jeff],
      Vardar: [sahin]
    });
  });
});

describe('toRecord tests', () => {
  test('empty map', () => {
    const rec = toRecord(new Map());
    expect(rec).toStrictEqual({});
  });
  test('normal usage', () => {
    const map = new Map<string, string>([
      ['k1', 'v1'],
      ['k2', 'v2'],
      ['k3', 'v3']
    ]);
    const rec = toRecord(map);
    expect(rec).toStrictEqual({
      k1: 'v1',
      k2: 'v2',
      k3: 'v3'
    });
  });
});

describe('getTsConfig tests', () => {
  test('relative path', () => {
    expect(getTsConfig('.')).toBe(path.resolve('tsconfig.json'));
    expect(getTsConfig('./')).toBe(path.resolve('tsconfig.json'));
    expect(getTsConfig('./tsconfig.json')).toBe(path.resolve('tsconfig.json'));
  });

  test('package relative path', () => {
    expect(getTsConfig('@apimda/devtime')).toBe(path.resolve('tsconfig.json'));
    expect(getTsConfig('@apimda/devtime/')).toBe(path.resolve('tsconfig.json'));
    expect(getTsConfig('@apimda/devtime/tsconfig.json')).toBe(path.resolve('tsconfig.json'));
  });

  test('tsconfig not found', () => {
    expect(() => getTsConfig('@apimda/devtime/file-does-not-exists.json')).toThrowError();
    expect(() => getTsConfig('./file-does-not-exists.json')).toThrowError();
    expect(() => getTsConfig('/')).toThrowError();
    expect(() => getTsConfig('/file-does-not-exists.json')).toThrowError();
  });
});
