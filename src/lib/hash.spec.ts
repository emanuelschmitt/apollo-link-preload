import { sha256 } from './hash';

test('sha256', () => {
  const actual = sha256('test');
  expect(actual).toEqual(
    '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
  );
});
