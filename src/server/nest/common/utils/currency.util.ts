import Decimal from 'decimal.js';

export class CurrencyUtil {
  public static readonly PLATFORM_FEE_PERCENTAGE = new Decimal('0.05'); // 5%
  public static readonly DOCTOR_SHARE_PERCENTAGE = new Decimal('0.95'); // 95%

  /**
   * Calculates 95% doctor earnings and 5% platform fee for a given gross amount
   */
  public static calculateSplit(grossAmountInput: number | string | Decimal) {
    const gross = new Decimal(grossAmountInput);

    if (gross.isNegative() || gross.isZero()) {
      return {
        grossAmount: new Decimal(0),
        platformFee: new Decimal(0),
        doctorAmount: new Decimal(0),
      };
    }

    const platformFee = gross.mul(this.PLATFORM_FEE_PERCENTAGE).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    const doctorAmount = gross.sub(platformFee);

    return {
      grossAmount: gross.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      platformFee,
      doctorAmount,
    };
  }
}
