import CacheStoreDAO from "../DAOs/CacheStoreDAO.mjs";

class CacheStoreService {
    constructor() {
        this.cacheStoreDAO = new CacheStoreDAO();
    }

    // Save data on cache store
    async saveCache(cacheStoreModel) {
        try {
            await this.cacheStoreDAO.save(cacheStoreModel);
            
        } catch (error) {
            throw error;
        }
    }

    // Get all countries
    async getAllCountries() {
        try {
            return await this.cacheStoreDAO.getAllCountries();

        } catch (error) {
            throw error;
        }
    }

}

export default CacheStoreService;