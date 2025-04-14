import AdminService from '../services/AdminService.mjs';
import UserDAO from '../DAOs/UserDAO.mjs';
import ApiKeyUsageDAO from '../DAOs/ApiKeyUsageDAO.mjs';
import CacheStoreService from './CacheStoreService.mjs';
import SubscriptionUserDAO from '../DAOs/SubscriptionUserDAO.mjs';
import ErrorLogDAO from '../DAOs/ErrorLogDAO.mjs';
import SubscriptionTypeDAO from '../DAOs/SubscriptionTypesDAO.mjs';
import ApiKeyDAO from '../DAOs/ApiKeyDAO.mjs';
import dotenv from 'dotenv';

dotenv.config();

class DashboardService {
    constructor() {
        this.adminService = new AdminService();
        this.userDAO = new UserDAO();
        this.apiKeyUsageDAO = new ApiKeyUsageDAO();
        this.cacheStoreService = new CacheStoreService();
        this.subscriptionUserDAO = new SubscriptionUserDAO();
        this.errorLogDAO = new ErrorLogDAO();
        this.subscriptionTypeDAO = new SubscriptionTypeDAO();
        this.apiKeyDAO = new ApiKeyDAO();
    }

    // Admin dashboard
    async getAdminDashboard() {
        const onlineUsers = await this.cacheStoreService.getOnlineAdminsAndUsersBySesions();
        return {
            adminCount: await this.adminService.getAdminCount(),
            userCount: await this.userDAO.getUsersCount(),
            subscriptionTypesCount: await this.subscriptionTypeDAO.getSubscriptionTypesCount(),
            apiKeyCount: await this.apiKeyDAO.getAllApiKeyCount(),
            errorCount: await this.errorLogDAO.getErrorLogCount(),
            subscriptionUserCount: await this.subscriptionUserDAO.getSubscribeUsersCount(),
            apiKeyUsage: await this.apiKeyUsageDAO.getAllApiKeyUsage(),
            onlineAdminsCount: onlineUsers.adminsCount,
            onlineUsersCount: onlineUsers.usersCount,
            income: await this.subscriptionUserDAO.getIncome(),
        };
    }

    // User dashboard
    async getUserDashboard(usersId) {
        // subscription lan
        // api key usage
        // include
        return {
            subscriptionPlan: await this.subscriptionUserDAO.getUserSubscription(usersId),
            apiKyeUsage: "",
            incluge: ""
        };
    }
}

export default DashboardService;
