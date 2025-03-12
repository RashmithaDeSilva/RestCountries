import argon2 from "argon2";
import HashErros from '../errors/HashErrors.mjs';

const generateHash = async (password) => {
    try {
        return await argon2.hash(password, {
            type: argon2.argon2id, // More secure than argon2i
            memoryCost: 2 ** 16, // 64MB, adjusts security/performance balance
            timeCost: 3, // Number of iterations
            parallelism: 1, // Number of parallel threads
        });

    } catch (error) {
        throw new Error(HashErros.HASHING_FAILED);
    }
};

const verify = async (hash, password) => {
    try {
        return await argon2.verify(hash, password);

    } catch (error) {
        throw new Error(HashErros.HASH_VERIFICATION_FAILED);
    }
};

export { generateHash, verify };
