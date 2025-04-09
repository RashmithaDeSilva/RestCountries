import AdminDAO from '../DAOs/AdminDAO.mjs';
import AdminModel from '../models/AdminModel.mjs';
import { generateHash, verify } from '../utils/security/Hash.mjs';
import DatabaseErrors from '../utils/errors/DatabaseErrors.mjs';
import dotenv from 'dotenv';
import HashErrors from '../utils/errors/HashErrors.mjs';

dotenv.config();

class AdminService {
    constructor() {
        this.adminDAO = new AdminDAO();
    }

    // Create admin
    async createAdmin(data) {
        let adminId;
        try {
            // Generate hash
            const hashPassword = await generateHash(data.password);
            
            // Create admin model
            const admin = AdminModel.getRequestAdminModel(
                data.first_name,
                data.surname,
                data.email,
                data.contact_number,
                hashPassword,
                data.roll
            );

            // Save admin in database
            adminId = await this.adminDAO.create(admin);
            return adminId;

        } catch (error) {
            throw error;
        }
    }

    // Update admin
    async updateAdmin(data) {
        try {
            // Create admin model
            const admin = new AdminModel(
                data.first_name,
                data.surname,
                data.email,
                data.contact_number,
                data.roll,
                data.id
            );

            // Update admin in database
            await this.adminDAO.update(admin);

        } catch (error) {
            throw error;
        }
    }

    // Change password
    async changePassword(data) {
        try {
            // Validate old password
            const passwordHash = await this.adminDAO.getHashPasswordById(data.id);
            const passwordVerify = await verify(passwordHash, data.old_password);
            if (!passwordVerify) throw new Error(HashErrors.INVALID_OLD_PASSWORD);
            const hashPassword = await generateHash(data.password);
            await this.adminDAO.changePassword(data.id, hashPassword);

        } catch (error) {
            throw error;
        }
    }

    // Authenticat admin
    async authenticateAdmin(email, password) {
        try {
            const admin = await this.adminDAO.getAdminByEmail(email);
            const passwordVerify = await verify(admin.passwordHash, password);
            if (!passwordVerify) throw new Error(DatabaseErrors.INVALID_EMAIL_ADDRESS_OR_PASSWORD);
            return AdminModel.getResponseAdminModel(
                admin.firstName,
                admin.surname,
                admin.email,
                admin.contactNumber,
                admin.roll,
                admin.id
            );
            
        } catch (error) {
            throw error;
        }
    }

    // Get admin by admin id
    async getAdminById(id) {
        try {
            const admin = await this.adminDAO.getAdminById(id);
            if (!admin) throw new Error(DatabaseErrors.ADMIN_NOT_FOUND);
            return admin;
            
        } catch (error) {
            throw error;
        }
    }

    // Remove admin
    async removeAdmin(id) {
        try {
            await this.adminDAO.removeAdmin(id);
            
        } catch (error) {
            throw error;
        }
    }

}

export default AdminService;
