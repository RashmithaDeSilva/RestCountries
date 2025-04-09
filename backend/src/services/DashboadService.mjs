import AdminDAO from '../DAOs/AdminDAO.mjs';
import UserDAO from '../DAOs/UserDAO.mjs';
import ApiKeyUsageDAO from '../DAOs/ApiKeyUsageDAO.mjs';
import CacheStoreDAO from '../DAOs/CacheStoreDAO.mjs';
import SubscriptionUserDAO from '../DAOs/SubscriptionUserDAO.mjs';
import ErrorLogDAO from '../DAOs/ErrorLogDAO.mjs';
import SubscriptionTypeDAO from '../DAOs/SubscriptionTypesDAO.mjs';
import ApiKeyDAO from '../DAOs/ApiKeyDAO.mjs';
import dotenv from 'dotenv';

dotenv.config();

class DashboardService {
    constructor() {
        this.adminDAO = new AdminDAO();
        this.userDAO = new UserDAO();
        this.apiKeyUsageDAO = new ApiKeyUsageDAO();
        this.cacheStoreDAO = new CacheStoreDAO();
        this.subscriptionUserDAO = new SubscriptionUserDAO();
        this.errorLogDAO = new ErrorLogDAO();
        this.subscriptionTypeDAO = new SubscriptionTypeDAO();
        this.apiKeyDAO = new ApiKeyDAO();
    }

    // Admin dashboard
    async getDashboard() {
        const onlineUsers = await this.cacheStoreDAO.getOnlineAdminsAndUsersBySesions();
        return {
            adminCount: await this.adminDAO.getAdminCount(),
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
    
}

export default DashboardService;
