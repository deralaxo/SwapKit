import { describe, expect, test } from 'vitest';

import { SwapKitNumber } from '../swapKitNumber.ts';

describe('SwapKitNumber', () => {
  describe('constructors', () => {
    test('creates numbers correctly', () => {
      const skNumber1 = new SwapKitNumber(1);
      expect(skNumber1.getValue('string')).toBe('1');
      expect(skNumber1.getValue('number')).toBe(1);
      expect(skNumber1.getValue('bigint')).toBe(100000000n);

      const skNumber2 = new SwapKitNumber('1');
      expect(skNumber2.getValue('string')).toBe('1');
      expect(skNumber2.getValue('bigint')).toBe(100000000n);

      const skNumber3 = new SwapKitNumber('0.0000000001');
      expect(skNumber3.getValue('string')).toBe('0.0000000001');
      expect(skNumber3.getValue('bigint')).toBe(1n);

      const skNumber4 = new SwapKitNumber(0.000000001);
      expect(skNumber4.getValue('string')).toBe('0.000000001');
      expect(skNumber4.getValue('bigint')).toBe(1n);

      const skNumber6 = new SwapKitNumber({ value: 0.1005, decimal: 3 });
      expect(skNumber6.getValue('string')).toBe('0.101');
      expect(skNumber6.getValue('bigint')).toBe(10050000n);

      const skNumber7 = new SwapKitNumber({ value: -0.1005, decimal: 3 });
      expect(skNumber7.getValue('string')).toBe('-0.101');
      expect(skNumber7.getValue('bigint')).toBe(-10050000n);
      expect(skNumber7.decimal).toBe(3);
      expect(skNumber7.getValue('number')).toBe(-0.101);
      expect(skNumber7.decimalMultiplier).toBe(100000000n);
    });

    test('creates SwapKitInstance from BigInt: (12.345678901234, decimals: 12)', () => {
      const skNumber = SwapKitNumber.fromBigInt(12345678901234n, 12);

      expect(skNumber.getValue('string')).toBe('12.345678901234');
      expect(skNumber.getValue('bigint')).toBe(12345678901234n);
    });
  });

  describe('shiftDecimals', () => {
    test('shifts up and bumps number', () => {
      const skNumber = new SwapKitNumber(1);
      expect(skNumber.getValue('string')).toBe('1');
      expect(skNumber.getValue('bigint')).toBe(100000000n);

      const shiftedSkNumber = SwapKitNumber.shiftDecimals({
        value: skNumber,
        from: 6,
        to: 8,
      });

      expect(shiftedSkNumber.getValue('string')).toBe('100');
      expect(shiftedSkNumber.getValue('bigint')).toBe(10000000000n);
    });

    test('shifts down and rounds down number', () => {
      const skNumber = new SwapKitNumber(2.12345678);
      expect(skNumber.getValue('string')).toBe('2.12345678');
      expect(skNumber.getValue('bigint')).toBe(212345678n);

      const shiftedSkNumber = SwapKitNumber.shiftDecimals({
        value: skNumber,
        from: 8,
        to: 6,
      });

      expect(shiftedSkNumber.getValue('string')).toBe('2.123456');
      expect(shiftedSkNumber.getValue('bigint')).toBe(212345600n);
    });
  });

  describe('getValue', () => {
    describe('string', () => {
      test('returns string value', () => {
        const skNumber = new SwapKitNumber(1);
        expect(skNumber.getValue('string')).toBe('1');
      });

      test('returns string value with decimals', () => {
        const skNumber = new SwapKitNumber(0.01);
        expect(skNumber.getValue('string')).toBe('0.01');
      });
    });

    describe('number', () => {
      test('returns number value', () => {
        const skNumber = new SwapKitNumber(1);
        expect(skNumber.getValue('number')).toBe(1);
      });

      test('returns number value with decimals', () => {
        const skNumber = new SwapKitNumber(0.01);
        expect(skNumber.getValue('number')).toBe(0.01);
      });
    });

    describe('bigint', () => {
      test('returns bigint value', () => {
        const skNumber = new SwapKitNumber(1);
        expect(skNumber.getValue('bigint')).toBe(100000000n);
      });
    });
  });

  describe('toSignificant', () => {
    describe('normal cases', () => {
      test('returns first significant number of digits', () => {
        const usdLikeNumber = new SwapKitNumber(1234.5678);
        expect(usdLikeNumber.toSignificant(2)).toBe('1200');
        expect(usdLikeNumber.toSignificant(3)).toBe('1230');
        expect(usdLikeNumber.toSignificant(4)).toBe('1234');
        expect(usdLikeNumber.toSignificant(5)).toBe('1234.5');
        expect(usdLikeNumber.toSignificant(6)).toBe('1234.56');
        expect(usdLikeNumber.toSignificant(7)).toBe('1234.567');
        expect(usdLikeNumber.toSignificant(8)).toBe('1234.5678');

        const btcLikeNumber = new SwapKitNumber(0.00005678);
        expect(btcLikeNumber.toSignificant(2)).toBe('0.000056');
        expect(btcLikeNumber.toSignificant(3)).toBe('0.0000567');
        expect(btcLikeNumber.toSignificant(4)).toBe('0.00005678');
        expect(btcLikeNumber.toSignificant(5)).toBe('0.00005678');
        expect(btcLikeNumber.toSignificant(8)).toBe('0.00005678');
      });
    });

    describe('custom decimals', () => {
      test('returns first significant number of digits', () => {
        const usdLikeNumber = new SwapKitNumber({ value: 1234.5678, decimal: 2 });
        expect(usdLikeNumber.toSignificant(2)).toBe('1200');
        expect(usdLikeNumber.toSignificant(3)).toBe('1230');
        expect(usdLikeNumber.toSignificant(4)).toBe('1234');
        expect(usdLikeNumber.toSignificant(5)).toBe('1234.5');
        expect(usdLikeNumber.toSignificant(6)).toBe('1234.57');
        expect(usdLikeNumber.toSignificant(7)).toBe('1234.57');
        expect(usdLikeNumber.toSignificant(8)).toBe('1234.57');

        const ethLikeNumber = new SwapKitNumber({ value: 0.00005678, decimal: 18 });
        expect(ethLikeNumber.toSignificant(2)).toBe('0.000056');
        expect(ethLikeNumber.toSignificant(3)).toBe('0.0000567');
        expect(ethLikeNumber.toSignificant(4)).toBe('0.00005678');
        expect(ethLikeNumber.toSignificant(5)).toBe('0.00005678');
        expect(ethLikeNumber.toSignificant(8)).toBe('0.00005678');
        expect(ethLikeNumber.toSignificant(18)).toBe('0.00005678');
      });
    });
  });

  describe('add', () => {
    test('adds same type numbers correctly', () => {
      const skNumber1 = new SwapKitNumber(10);
      const skNumber2 = new SwapKitNumber('5');
      const skNumber3 = new SwapKitNumber('0.5');
      const result = skNumber1.add(skNumber2, skNumber3);

      expect(result.getValue('string')).toBe('15.5');
      expect(result.getValue('bigint')).toBe(1550000000n);
    });

    test('adds different type numbers correctly', () => {
      const skNumber1 = new SwapKitNumber(10);
      const result = skNumber1.add(6, '0.5');

      expect(result.getValue('string')).toBe('16.5');
      expect(result.getValue('bigint')).toBe(1650000000n);
    });

    test('adds large decimal numbers correctly', () => {
      const skNumber1 = new SwapKitNumber(0.0000000001);
      const result = skNumber1.add(6.000000000001, '0.0000000000000005');
      expect(result.getValue('string')).toBe('6.0000000001010005');
      expect(result.getValue('bigint')).toBe(60000000001010005n);
    });
  });

  describe('sub', () => {
    test('subtracts same type numbers correctly', () => {
      const skNumber1 = new SwapKitNumber(10);
      const skNumber2 = new SwapKitNumber('5');
      const skNumber3 = new SwapKitNumber(0.5);
      const result = skNumber1.sub(skNumber2, skNumber3);

      expect(result.getValue('string')).toBe('4.5');
      expect(result.getValue('bigint')).toBe(450000000n);
    });

    test('subtracts different type numbers correctly', () => {
      const skNumber1 = new SwapKitNumber(10);
      const result = skNumber1.sub(6, '0.5');

      expect(result.getValue('string')).toBe('3.5');
      expect(result.getValue('bigint')).toBe(350000000n);
    });

    test('can process negative results', () => {
      const skNumber1 = new SwapKitNumber(10);
      const result0 = skNumber1.sub(10);
      const resultMinus = result0.sub('10');

      expect(result0.getValue('string')).toBe('0');
      expect(resultMinus.getValue('string')).toBe('-10');
      expect(result0.getValue('bigint')).toBe(0n);
      expect(resultMinus.getValue('bigint')).toBe(-1000000000n);
    });
  });

  describe('mul', () => {
    test('multiplies same type numbers correctly', () => {
      const skNumber1 = new SwapKitNumber(10);
      const skNumber2 = new SwapKitNumber('5');
      const skNumber3 = new SwapKitNumber(0.5);
      const result = skNumber1.mul(skNumber2, skNumber3);

      expect(result.getValue('string')).toBe('25');
      expect(result.getValue('bigint')).toBe(2500000000n);
    });

    test('multiplies different type numbers correctly', () => {
      const skNumber1 = new SwapKitNumber(10);
      const result = skNumber1.mul(6, '0.5');

      expect(result.getValue('string')).toBe('30');
      expect(result.getValue('bigint')).toBe(3000000000n);
    });

    test('multiplies numbers correctly if decimals of SKN is lower than number multiplied with', () => {
      const skNumber1 = new SwapKitNumber({ value: 1000000, decimal: 4 });
      const result = skNumber1.mul('0.00001');

      expect(result.getValue('string')).toBe('10');
      expect(result.getValue('bigint')).toBe(1000000000n);
    });

    test('should correctly round the result of multiplication', () => {
      const skNumber1 = new SwapKitNumber({ decimal: 2, value: 1.23 });
      const skNumber2 = new SwapKitNumber({ decimal: 4, value: 4.56 });

      const result = skNumber1.mul(skNumber2);

      // The exact result of 1.23 * 4.56 is 5.6088
      // If we round it to 2 decimal places, we should get 5.61
      expect(result.getValue('string')).toBe('5.61');
      expect(result.getValue('bigint')).toBe(560880000n);

      const skNumber3 = new SwapKitNumber({ decimal: 2, value: 1.23 });
      const skNumber4 = new SwapKitNumber(-1.234567891);

      const result2 = skNumber3.mul(skNumber4);

      // The exact result of 1.23 * -1.234567891 is -1,518518505
      // If we round it to 2 decimal places, we should get 5.61
      expect(result2.getValue('string')).toBe('-1.52');
      expect(result2.getValue('bigint')).toBe(-1518518505n);
    });
  });

  describe('div', () => {
    test('divides same type numbers correctly', () => {
      const skNumber1 = new SwapKitNumber(10);
      const skNumber2 = new SwapKitNumber('5');
      const skNumber3 = new SwapKitNumber(0.5);
      const result = skNumber1.div(skNumber2, skNumber3);

      expect(result.getValue('string')).toBe('4');
      expect(result.getValue('bigint')).toBe(400000000n);

      const skNumber4 = new SwapKitNumber(10.12);
      const result2 = skNumber4.div(0.0001);

      expect(result2.getValue('string')).toBe('101200');
      expect(result2.getValue('bigint')).toBe(10120000000000n);
    });

    test('divides different type numbers correctly', () => {
      const skNumber1 = new SwapKitNumber(20);
      const result = skNumber1.div(5, '0.5');

      expect(result.getValue('string')).toBe('8');
      expect(result.getValue('bigint')).toBe(800000000n);
    });

    test('divides different type numbers correctly when decimal is set', () => {
      const skNumber1 = new SwapKitNumber({ value: '1.2', decimal: 2 });
      const result = skNumber1.div(0.001);

      expect(result.getValue('string')).toBe('1200');
      expect(result.getValue('bigint')).toBe(120000000000n);
    });

    test('divides smaller number by larger number', () => {
      const skNumber1 = new SwapKitNumber(1);
      const result = skNumber1.div(2);

      expect(result.getValue('string')).toBe('0.5');
      expect(result.getValue('bigint')).toBe(50000000n);
    });

    test('divides a number with 18 decimals by a negative number with less decimals', () => {
      const skNumber1 = new SwapKitNumber({ value: '1.000000000000000010', decimal: 18 });
      const skNumber2 = new SwapKitNumber({ value: '-2', decimal: 1 });

      const result = skNumber1.div(skNumber2);

      // The exact result of 1.000000000000000010 / -2 is -0.500000000000000005
      expect(result.getValue('string')).toBe('-0.500000000000000005');
      expect(result.getValue('bigint')).toBe(-500000000000000005n);
    });

    test('divides a number with 2 decimals by a negative number with more decimals', () => {
      const skNumber1 = new SwapKitNumber({ value: '2', decimal: 2 });
      const skNumber2 = new SwapKitNumber({ value: '-0.000005', decimal: 18 });

      const result = skNumber1.div(skNumber2);

      // The exact result of 2 / -0.000005 is -400000
      expect(result.getValue('string')).toBe('-400000');
      expect(result.getValue('bigint')).toBe(-40000000000000n);
    });
  });

  describe('shitcoin cases', () => {
    test('multiply huge numbers', () => {
      const skNumber1 = new SwapKitNumber({ value: 1_000_000_000_000_001, decimal: 18 });
      const skNumber2 = new SwapKitNumber({ value: 987_654_321_000, decimal: 18 });

      const result = skNumber1.mul(skNumber2);
      expect(result.getValue('string')).toBe('987654321000000987654321000');
      expect(result.getValue('bigint')).toBe(987654321000000987654321000000000000000000000n);
    });

    test('divide huge numbers', () => {
      const skNumber1 = new SwapKitNumber({ value: 1_000_000_000_000_001, decimal: 18 });
      const skNumber2 = new SwapKitNumber({ value: 987_654_321_000, decimal: 18 });

      const result = skNumber1.div(skNumber2);
      expect(result.getValue('string')).toBe('1012.4999999873447625');
      expect(result.getValue('bigint')).toBe(1012499999987344762500n);
    });
  });

  describe('gt', () => {
    test('greater than', () => {
      const skNumber1 = new SwapKitNumber(10);
      const skNumber2 = new SwapKitNumber('5');

      expect(skNumber1.gt(skNumber2)).toBe(true);
      expect(skNumber2.gt(skNumber1)).toBe(false);
    });
  });

  describe('gte', () => {
    test('greater than or equal', () => {
      const skNumber1 = new SwapKitNumber(10);
      const skNumber2 = new SwapKitNumber('5');

      expect(skNumber1.gte(skNumber2)).toBe(true);
      expect(skNumber1.gte(skNumber1)).toBe(true);
      expect(skNumber2.gte(skNumber1)).toBe(false);
    });
  });

  describe('lt', () => {
    test('less than', () => {
      const skNumber1 = new SwapKitNumber(10);
      const skNumber2 = new SwapKitNumber('5');

      expect(skNumber1.lt(skNumber2)).toBe(false);
      expect(skNumber2.lt(skNumber1)).toBe(true);
    });
  });

  describe('lte', () => {
    test('less than or equal', () => {
      const skNumber1 = new SwapKitNumber(10);
      const skNumber2 = new SwapKitNumber('5');

      expect(skNumber1.lte(skNumber2)).toBe(false);
      expect(skNumber1.lte(skNumber1)).toBe(true);
      expect(skNumber2.lte(skNumber1)).toBe(true);
    });
  });

  describe('eq', () => {
    test('equal', () => {
      const skNumber1 = new SwapKitNumber(10);
      const skNumber2 = new SwapKitNumber('5');

      expect(skNumber1.eq(skNumber2)).toBe(false);
      expect(skNumber1.eq(skNumber1)).toBe(true);
      expect(skNumber2.eq(skNumber1)).toBe(false);
    });
  });

  describe('Throws', () => {
    test('throws if division by zero', () => {
      const skNumber1 = new SwapKitNumber(10);
      const skNumber2 = new SwapKitNumber('0');

      expect(() => skNumber1.div(skNumber2)).toThrow(RangeError);
      expect(() => skNumber1.div(0)).toThrow(RangeError);
    });
  });
});
