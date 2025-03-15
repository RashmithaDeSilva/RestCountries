import { randomBytes } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();
const CHARSET = process.env.API_KEY_GENERATE_CHARSET 
|| 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
const length = Number(process.env.API_KEY_LENGTH || 64);

const generateApiKey = () => {
    const bytes = randomBytes(length);
    let apiKey = '';

    for (let i = 0; i < length; i++) {
        apiKey += CHARSET[bytes[i] % CHARSET.length];
    }
    return apiKey;
}

export default generateApiKey;