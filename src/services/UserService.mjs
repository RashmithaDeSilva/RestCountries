import UserDAO from '../DAOs/UserDAO.mjs';
import UserModel from '../models/UserModel.mjs';
import ErrorLogService from './ErrorLogService.mjs';
import { generateHash, verify } from '../utils/security/Hash.mjs';
import CommonErrors from '../utils/errors/CommonErrors.mjs';
import DatabaseErrors from '../utils/errors/DatabaseErrors.mjs';
import dotenv from 'dotenv';

dotenv.config();

class UserService {
    constructor() {
        this.userDAO = new UserDAO();
        this.errorLogService = new ErrorLogService();
    }

    // Create user
    async createUser(data) {
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
            return await this.userDAO.create(user);

        } catch (error) {
            if (process.env.ENV === "DEV") {
                throw error;
            }

            switch (error.message) {
                case DatabaseErrors.EMAIL_ALREADY_EXISTS:
                    throw error;

                default:
                    await this.errorLogService.createLog("UserService.createUser", error, data);
                    throw new Error(CommonErrors.INTERNAL_SERVER_ERROR);
            }
        }
    }

    // Get user
    // async getUser(email) {
    //     try {
    //         const user = await this.userDAO.getUser(data.email);
    //         if (!user) throw new Error(DatabaseErrors.USER_NOT_FOUND);
    //         return user;
            
    //     } catch (error) {
    //         if (process.env.ENV === "DEV") {
    //             throw error;
    //         }

    //         await this.errorLogService.createLog("UserService.authenticateUser", error, data);
    //         throw new Error(CommonErrors.INTERNAL_SERVER_ERROR);
    //     }
    // }

    // Authenticat user
    async authenticateUser(email, password) {
        try {
            const user = await this.userDAO.getUser(email);
            const passwordVerify = await verify(user.passwordHash, password);
            if (!passwordVerify) throw new Error(DatabaseErrors.INVALID_EMAIL_ADDRESS_OR_PASSWORD);
            return user;
            
        } catch (error) {
            if (process.env.ENV === "DEV") {
                throw error;
            }

            switch (error.message) {
                case DatabaseErrors.INVALID_EMAIL_ADDRESS:
                    throw error;

                case DatabaseErrors.INVALID_EMAIL_ADDRESS_OR_PASSWORD:
                    throw error;

                default:
                    await this.errorLogService.createLog("UserService.authenticateUser", error, { email });
                    throw new Error(CommonErrors.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async findUser(id) {
        try {
            const user = await this.userDAO.findUser(id);
            if (!user) throw new Error(DatabaseErrors.USER_NOT_FOUND);
            return user;
            
        } catch (error) {
            if (process.env.ENV === "DEV") {
                throw error;
            }

            await this.errorLogService.createLog("UserService.findUser", error, id);
            throw new Error(CommonErrors.INTERNAL_SERVER_ERROR);
        }
    }
}

export default UserService;
