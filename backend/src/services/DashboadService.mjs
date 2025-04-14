import AdminService from '../services/AdminService.mjs';
import UserService from './UserService.mjs';
import ApiKeyUsageService from './ApiKeyUsageService.mjs';
import CacheStoreService from './CacheStoreService.mjs';
import SubscriptionUserService from './SubscriptionUserService.mjs';
import ErrorLogService from './ErrorLogService.mjs';
import SubscriptionTypeService from './SubscriptionTypeService.mjs';
import ApiKeyService from './ApiKeyService.mjs';
import dotenv from 'dotenv';

dotenv.config();

class DashboardService {
    constructor() {
        this.adminService = new AdminService();
        this.userService = new UserService();
        this.apiKeyUsageService = new ApiKeyUsageService();
        this.cacheStoreService = new CacheStoreService();
        this.subscriptionUserService = new SubscriptionUserService();
        this.errorLogService = new ErrorLogService();
        this.subscriptionTypeService = new SubscriptionTypeService();
        this.apiKeyService = new ApiKeyService();
    }

    // Admin dashboard
    async getAdminDashboard() {
        const onlineUsers = await this.cacheStoreService.getOnlineAdminsAndUsersBySesions();
        return {
            adminCount: await this.adminService.getAdminCount(),
            userCount: await this.userService.getUsersCount(),
            subscriptionTypesCount: await this.subscriptionTypeService.getSubscriptionTypesCount(),
            apiKeyCount: await this.apiKeyService.getAllApiKeyCount(),
            errorCount: await this.errorLogService.getErrorLogCount(),
            subscriptionUserCount: await this.subscriptionUserService.getSubscribeUsersCount(),
            apiKeyUsage: await this.apiKeyUsageService.getAllApiKeyUsage(),
            onlineAdminsCount: onlineUsers.adminsCount,
            onlineUsersCount: onlineUsers.usersCount,
            income: await this.subscriptionUserService.getIncome(),
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
