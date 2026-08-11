"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordUtil = void 0;
const argon2 = require("argon2");
class PasswordUtil {
    static async hashPassword(password) {
        return argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1,
        });
    }
    static async verifyPassword(hash, plain) {
        try {
            return await argon2.verify(hash, plain);
        }
        catch {
            return false;
        }
    }
}
exports.PasswordUtil = PasswordUtil;
//# sourceMappingURL=password.util.js.map