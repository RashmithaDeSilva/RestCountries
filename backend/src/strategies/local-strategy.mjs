import passport from "passport";
import { Strategy } from "passport-local";
import AdminService from "../services/AdminService.mjs";
import UserService from "../services/UserService.mjs";
import DatabaseErrors from "../utils/errors/DatabaseErrors.mjs";
import CommonErrors from "../utils/errors/CommonErrors.mjs";
import AdminModel from "../models/AdminModel.mjs";
import UserModel from "../models/UserModel.mjs";

const adminService = new AdminService();
const userService = new UserService();

// Take user object and store in session
passport.serializeUser((userOrAdmin, done) => {
    done(null, {
        "id": userOrAdmin.id,
        "roll": userOrAdmin?.roll ? userOrAdmin.roll : "USER"
    });
});

// Take data from session
passport.deserializeUser(async (sessionData, done) => {
    try {
        const userOrAdmin = sessionData.roll !== "USER" ? 
        await adminService.getAdminById(sessionData.id) : 
        await userService.getUserById(sessionData.id);

        const responseModel = userOrAdmin?.roll ? 
        AdminModel.getResponseAdminModel(
            userOrAdmin.firstName, 
            userOrAdmin.surname,
            userOrAdmin.email,
            userOrAdmin.contactNumber,
            userOrAdmin.roll,
            userOrAdmin.id
        ) : 
        UserModel.getResponseUserModel(
            userOrAdmin.firstName, 
            userOrAdmin.surname,
            userOrAdmin.email,
            userOrAdmin.contactNumber,
            userOrAdmin.verify,
            userOrAdmin.id
        );
        if (!userOrAdmin) throw new Error(DatabaseErrors.USER_NOT_FOUND);
        done(null, responseModel);

    } catch (error) {
        done(error, false);
    }
});

// Admin strategy
const localAdminStregy = passport.use(
    'local-admin', new Strategy({ usernameField: 'email' }, 
        async (email, password, done) => {
        try {
            const admin = await adminService.authenticateAdmin(email, password);
            done(null, admin);

        } catch (error) {
            if (error.message === DatabaseErrors.INVALID_EMAIL_ADDRESS_OR_PASSWORD 
                || error.message === DatabaseErrors.INVALID_EMAIL_ADDRESS) {
                return done(new Error(DatabaseErrors.INVALID_EMAIL_ADDRESS_OR_PASSWORD), false);  // Expected errors
            }
            return done(process.env.ENV === "DEV" ? 
                error : new Error(CommonErrors.INTERNAL_SERVER_ERROR), false); // Unexpected errors (500)
        }
    })
);

// User strategy
const localUserStrategy = passport.use(
    'local-user', new Strategy({ usernameField: 'email' }, 
        async (email, password, done) => {
        try {
            const user = await userService.authenticateUser(email, password);
            done(null, user);

        } catch (error) {
            if (error.message === DatabaseErrors.INVALID_EMAIL_ADDRESS_OR_PASSWORD 
                || error.message === DatabaseErrors.INVALID_EMAIL_ADDRESS) {
                return done(new Error(DatabaseErrors.INVALID_EMAIL_ADDRESS_OR_PASSWORD), false);  // Expected errors
            }
            return done(process.env.ENV === "DEV" ? 
                error : new Error(CommonErrors.INTERNAL_SERVER_ERROR), false); // Unexpected errors (500)
        }
    })
);

export { localAdminStregy, localUserStrategy };
