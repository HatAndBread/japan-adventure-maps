import { uniq } from 'lodash';

export const stringIsValidQuillDelta = (deltaString: any) => {
  try {
    const data = JSON.parse(deltaString);
    if (data.ops.length === 1 && data.ops[0].insert === '\n') return false;
    if (!uniq(data.ops[0].insert.split('\n'))[0]) return false;
    return true;
  } catch {
    return false;
  }
};
