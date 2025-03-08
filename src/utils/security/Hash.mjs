import argon2 from "argon2";

const generateHash = async (password) => {
    try {
        return await argon2.hash(password, {
            type: argon2.argon2id, // More secure than argon2i
            memoryCost: 2 ** 16, // 64MB, adjusts security/performance balance
            timeCost: 3, // Number of iterations
            parallelism: 1, // Number of parallel threads
        });

    } catch (error) {
        throw new Error("Hashing failed");
    }
};

const verify = async (hash, password) => {
    try {
        return await argon2.verify(hash, password);

    } catch (error) {
        throw new Error("Hash verification failed");
    }
};

export { generateHash, verify };
