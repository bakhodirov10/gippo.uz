import Decimal from 'decimal.js';
export declare class CurrencyUtil {
    static readonly PLATFORM_FEE_PERCENTAGE: Decimal;
    static readonly DOCTOR_SHARE_PERCENTAGE: Decimal;
    static calculateSplit(grossAmountInput: number | string | Decimal): {
        grossAmount: Decimal;
        platformFee: Decimal;
        doctorAmount: Decimal;
    };
}
