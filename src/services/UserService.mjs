import UserDAO from '../DAOs/UserDAO.mjs';
import UserModel from '../models/UserModel.mjs';
import ErrorLogService from './ErrorLogService.mjs';
import { generateHash } from '../utils/security/Hash.mjs';
import CommonErrors from '../utils/errors/CommonErrors.mjs';
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

            await this.errorLogService.createLog("UserService.createUser", error, data);
            throw new Error(CommonErrors.INTERNAL_SERVER_ERROR);
        }
    }
}

export default UserService;
