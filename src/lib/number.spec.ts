import { double, power } from './number';

test('double', () => {
  expect(double(2)).toEqual(4);
});

test('power', () => {
  expect(power(2, 4)).toEqual(16);
});
