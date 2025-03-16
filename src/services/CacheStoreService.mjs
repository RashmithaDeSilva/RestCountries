import CacheStoreDAO from "../DAOs/CacheStoreDAO.mjs";

class CacheStoreService {
    constructor() {
        this.cacheStoreDAO = new CacheStoreDAO();
    }

    async saveRestcountries(cacheStoreModel) {
        try {
            await this.cacheStoreDAO.save(cacheStoreModel);
            
        } catch (error) {
            throw error;
        }
    }

}

export default CacheStoreService;