import { CurrencyUtil } from './currency.util';

describe('CurrencyUtil Financial Accounting', () => {
  it('should correctly calculate 95% doctor share and 5% platform fee for 100,000 UZS', () => {
    const split = CurrencyUtil.calculateSplit(100000);

    expect(split.grossAmount.toNumber()).toBe(100000);
    expect(split.platformFee.toNumber()).toBe(5000);
    expect(split.doctorAmount.toNumber()).toBe(95000);
  });

  it('should correctly calculate split for uneven amounts without floating point errors', () => {
    const split = CurrencyUtil.calculateSplit(150000);

    expect(split.grossAmount.toNumber()).toBe(150000);
    expect(split.platformFee.toNumber()).toBe(7500);
    expect(split.doctorAmount.toNumber()).toBe(142500);
  });

  it('should handle zero or negative amounts gracefully', () => {
    const split = CurrencyUtil.calculateSplit(0);

    expect(split.grossAmount.toNumber()).toBe(0);
    expect(split.platformFee.toNumber()).toBe(0);
    expect(split.doctorAmount.toNumber()).toBe(0);
  });
});
