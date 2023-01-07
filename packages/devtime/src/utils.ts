import * as fs from 'fs';
import * as path from 'path';

export const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
  arr.reduce((groups, item) => {
    (groups[key(item)] ||= []).push(item);
    return groups;
  }, {} as Record<K, T[]>);

export const toRecord = <T, K extends keyof any>(map: Map<K, T>) =>
  Array.from(map.entries()).reduce((record, entry) => {
    record[entry[0]] = entry[1];
    return record;
  }, {} as Record<K, T>);

export const DEFAULT_TS_CONFIG = 'tsconfig.json';

export const getTsConfig = (tsConfigArg: string) => {
  tsConfigArg = tsConfigArg.length > 1 ? tsConfigArg.replace(/\/$/, '') : tsConfigArg;
  try {
    if (tsConfigArg.endsWith('.json')) {
      return require.resolve(tsConfigArg);
    }

    return require.resolve(`${tsConfigArg}/${DEFAULT_TS_CONFIG}`);
  } catch {
    const resolved = tsConfigArg.endsWith('.json')
      ? path.resolve(tsConfigArg)
      : path.resolve(tsConfigArg, DEFAULT_TS_CONFIG);
    if (!fs.existsSync(resolved)) {
      throw new Error('Could not find tsconfig file');
    }
    return resolved;
  }
};
