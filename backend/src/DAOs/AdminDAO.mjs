import { getDatabasePool } from '../config/SQLCon.mjs';
import AdminModel from '../models/AdminModel.mjs';
import DatabaseErrors from '../utils/errors/DatabaseErrors.mjs';
import dotenv from 'dotenv';

dotenv.config();
const pool = await getDatabasePool();

class AdminDAO {
    constructor () {
    }

    // Check email is exist
    async checkEmailIsExist(email) {
        try {
            const [row] = await pool.query("SELECT email FROM admins WHERE email = ?", [email]);
            return row.length > 0;

        } catch (error) {
            throw error;
        }
    }

    // Check id is exist
    async checkIdIsExist(id) {
        try {
            const [row] = await pool.query("SELECT id FROM admins WHERE id = ?", [id]);
            return row.length > 0;

        } catch (error) {
            throw error;
        }
    }

    // Get admins ID using email
    async getAdminIdByEmail(email) {
        try {
            const [row] = await pool.query("SELECT id FROM admins WHERE email = ?", [email]);
            if (row.length > 0) {
                return row[0].id;
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    // Create admins
    async create(admin) {
        try {
            // Check email is exist
            if (await this.checkEmailIsExist(admin.email)) throw new Error(DatabaseErrors.EMAIL_ALREADY_EXISTS);
            
            const [result] = await pool.query(`
                INSERT INTO admins (
                    first_name, 
                    surname, 
                    email, 
                    contact_number, 
                    password_hash,
                    roll
                ) values (?, ?, ?, ?, ?, ?)
            `, [admin.firstName, admin.surname, admin.email, admin.contactNumber, admin.passwordHash, admin.roll]);

            const adminId = process.env.ENV === "PROD" ? 
            result.insertId : await this.getAdminIdByEmail(admin.email);
            return adminId;

        } catch (error) {
            throw error;
        }
    }

    // Get password hash
    async getHashPasswordByEmail(email) {
        try {
            // Check email is exist
            if (!await this.checkEmailIsExist(email)) throw new Error(DatabaseErrors.INVALID_EMAIL_ADDRESS_OR_PASSWORD);

            const [row] = await pool.query(`SELECT password_hash FROM admins WHERE email = ?`, [email]);
            return row[0].password_hash;

        } catch (error) {
            throw error;
        }
    }

    // Get password hash
    async getHashPasswordById(id) {
        try {
            // Check id is exist
            if (!await this.checkIdIsExist(id)) throw new Error(DatabaseErrors.USER_NOT_FOUND);

            const [row] = await pool.query(`SELECT password_hash FROM admins WHERE id = ?`, [id]);
            return row[0].password_hash;

        } catch (error) {
            throw error;
        }
    }

    // Get admin using email
    async getAdminByEmail(email) {
        try {
            // Check email is exist
            if (!await this.checkEmailIsExist(email)) throw new Error(DatabaseErrors.INVALID_EMAIL_ADDRESS);
            
            const [row] = await pool.query(`SELECT * FROM admins WHERE email = ?`, [email]);
            return new AdminModel(
                row[0].first_name, 
                row[0].surname,
                row[0].email,
                row[0].contact_number,
                row[0].roll,
                row[0].password_hash,
                row[0].id,
            );

        } catch (error) {
            throw error;
        }
    }

    // Get admin using id
    async getAdminById(id) {
        try {
            const [row] = await pool.query(`SELECT * FROM admins WHERE id = ?`, [id]);
            return row.length === 0 ? null : new AdminModel(
                row[0].first_name, 
                row[0].surname,
                row[0].email,
                row[0].contact_number,
                row[0].roll,
                row[0].password_hash,
                row[0].id,
            );

        } catch (error) {
            throw error;
        }
    }

    // Update admin
    async update(admin) {
        try {
            // Check email is exist
            const id = await this.getAdminsIdByEmail(admin.email);
            if (id !== null && id !== admin.id) throw new Error(DatabaseErrors.EMAIL_ALREADY_EXISTS);
            
            await pool.query(`
                UPDATE admins 
                SET first_name = ?, surname = ?, email = ?, contact_number = ?, roll = ?
                WHERE id = ?
            `, [admin.firstName, admin.surname, admin.email, admin.contactNumber, admin.id]);

        } catch (error) {
            throw error;
        }
    }

    // Change password
    async changePassword(id, hashPassword) {
        try {
            await pool.query(`
                UPDATE admins 
                SET password_hash = ?
                WHERE id = ?
            `, [hashPassword, id]);

        } catch (error) {
            throw error;
        }
    }

    // Remove admin
    async removeAdmin(id) {
        try {
            if (id === 1) throw new Error(DatabaseErrors.OPERATION_CANNOT_BE_PERFORMED);
            await pool.query(`DELETE FROM admins WHERE id = ?`, [id]);

        } catch (error) {
            throw error;
        }
    }
}

export default AdminDAO;