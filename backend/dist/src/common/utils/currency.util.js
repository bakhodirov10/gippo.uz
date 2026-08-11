"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyUtil = void 0;
const decimal_js_1 = require("decimal.js");
class CurrencyUtil {
    static calculateSplit(grossAmountInput) {
        const gross = new decimal_js_1.default(grossAmountInput);
        if (gross.isNegative() || gross.isZero()) {
            return {
                grossAmount: new decimal_js_1.default(0),
                platformFee: new decimal_js_1.default(0),
                doctorAmount: new decimal_js_1.default(0),
            };
        }
        const platformFee = gross.mul(this.PLATFORM_FEE_PERCENTAGE).toDecimalPlaces(2, decimal_js_1.default.ROUND_HALF_UP);
        const doctorAmount = gross.sub(platformFee);
        return {
            grossAmount: gross.toDecimalPlaces(2, decimal_js_1.default.ROUND_HALF_UP),
            platformFee,
            doctorAmount,
        };
    }
}
exports.CurrencyUtil = CurrencyUtil;
CurrencyUtil.PLATFORM_FEE_PERCENTAGE = new decimal_js_1.default('0.05');
CurrencyUtil.DOCTOR_SHARE_PERCENTAGE = new decimal_js_1.default('0.95');
//# sourceMappingURL=currency.util.js.map