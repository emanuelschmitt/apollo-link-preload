import { asyncABC } from './async';

test('getABC', async () => {
  const result = await asyncABC();
  expect(result).toEqual(['a', 'b', 'c']);
});
