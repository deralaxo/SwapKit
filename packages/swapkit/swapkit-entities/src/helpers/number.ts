import { SwapkitNumber } from '../entities/number.js';

const add = (...values: string[]) => {
  return values.reduce((total, value) => SwapkitNumber.from(total).add(value).toString(), '0');
};

const mul = (...values: string[]) =>
  values.reduce((total, value) => SwapkitNumber.from(total).mul(value).toString(), '1');

const sub = (...values: string[]) =>
  values.reduce(
    (total, value, index) =>
      index === 0 ? value : SwapkitNumber.from(total).sub(value).toString(),
    '0',
  );

const div = (value: string, divisor: string) => SwapkitNumber.from(value).div(divisor).toString();

const total = add('1', '2', mul('2', '1'), div('2', sub('3', '1')));
