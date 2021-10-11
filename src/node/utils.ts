import path from 'path';
import { BuildOptions } from 'vite';

export function slash(path: string) {
  return path.replace(/\\/g, '/');
}

export function appendPluginId(str: string, id: string | undefined) {
  return `${str}${id ? `/${id}` : ''}`;
}

export function getEntries(
  root: string,
  input: NonNullable<BuildOptions['rollupOptions']>['input']
) {
  let inputArr: string[];

  if (!input) {
    inputArr = ['index.html'];
  } else if (typeof input === 'string') {
    inputArr = [input];
  } else if (Array.isArray(input)) {
    inputArr = input;
  } else {
    inputArr = Object.values(input);
  }

  return inputArr.map(inputPath => {
    return path.dirname(path.resolve(root, inputPath));
  });
}
