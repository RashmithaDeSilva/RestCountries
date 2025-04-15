import UserDAO from '../DAOs/UserDAO.mjs';
import UserModel from '../models/UserModel.mjs';
import { generateHash, verify } from '../utils/security/Hash.mjs';
import DatabaseErrors from '../utils/errors/DatabaseErrors.mjs';
import dotenv from 'dotenv';
import HashErrors from '../utils/errors/HashErrors.mjs';
import ApiKeyService from './ApiKeyService.mjs';
import ApiKeyErrors from '../utils/errors/ApiKeyErrors.mjs';

dotenv.config();

class UserService {
    constructor() {
        this.userDAO = new UserDAO();
        this.apiKeyService = new ApiKeyService();
    }

    // Create user
    async createUser(data) {
        let userId;
        try {
            // Generate hash
            const hashPassword = await generateHash(data.password);
            
            // Create user model
            const user = UserModel.getRequestUserModel(
                data.first_name,
                data.surname,
                data.email,
                data.contact_number,
                hashPassword
            );

            // Save user in database
            userId = await this.userDAO.create(user);

            // Create api key
            if (userId) await this.apiKeyService.createApiKey(userId, "API KEY");

            return userId;

        } catch (error) {
            if (error.message === ApiKeyErrors.FAILED_TO_GENERATE_A_API_KEY) return userId;
            throw error;
        }
    }

    // Update user
    async updateUser(data) {
        try {
            // Create user model
            const user = new UserModel(
                data.first_name,
                data.surname,
                data.email,
                data.contact_number,
                null,
                data.id
            );

            // Update user in database
            await this.userDAO.update(user);

        } catch (error) {
            throw error;
        }
    }

    // Change password
    async changePassword(data) {
        try {
            // Validate old password
            const passwordHash = await this.userDAO.getHashPasswordById(data.id);
            const passwordVerify = await verify(passwordHash, data.old_password);
            if (!passwordVerify) throw new Error(HashErrors.INVALID_OLD_PASSWORD);
            const hashPassword = await generateHash(data.password);
            await this.userDAO.changePassword(data.id, hashPassword);

        } catch (error) {
            throw error;
        }
    }

    // Authenticat user
    async authenticateUser(email, password) {
        try {
            const user = await this.userDAO.getUserByEmail(email);
            const passwordVerify = await verify(user.passwordHash, password);
            if (!passwordVerify) throw new Error(DatabaseErrors.INVALID_EMAIL_ADDRESS_OR_PASSWORD);
            return user;
            
        } catch (error) {
            throw error;
        }
    }

    // Get user by user id
    async getUserById(id) {
        try {
            const user = await this.userDAO.getUserById(id);
            if (!user) throw new Error(DatabaseErrors.USER_NOT_FOUND);
            return user;
            
        } catch (error) {
            throw error;
        }
    }

    // Get users count 
    async getUsersCount() {
        try {
            const usersCount = await this.userDAO.getUsersCount();
            return usersCount;
            
        } catch (error) {
            throw error;
        }
    }

    // User api key usage
    async userApiKeyUsage(userId) {
        try {
            const userApiKeyUsage = await this.userDAO.userApiKeyUsage(userId);
            return userApiKeyUsage;
            
        } catch (error) {
            throw error;
        }
    }
}

export default UserService;
