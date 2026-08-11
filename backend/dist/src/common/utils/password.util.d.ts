export declare class PasswordUtil {
    static hashPassword(password: string): Promise<string>;
    static verifyPassword(hash: string, plain: string): Promise<boolean>;
}
