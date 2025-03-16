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

    // Get country by name (Partial Match)
    async getCountryByName(name) {
        try {
            return await this.cacheStoreDAO.getCountryByName(name);
        } catch (error) {
            throw error;
        }
    }

    // Get country by currency (Partial Match)
    async getCountryByCurrency(currency) {
        try {
            return await this.cacheStoreDAO.getCountryByCurrency(currency);
        } catch (error) {
            throw error;
        }
    }

    // Get country by capital city (Partial Match)
    async getCountryByCapital(capital) {
        try {
            return await this.cacheStoreDAO.getCountryByCapital(capital);
        } catch (error) {
            throw error;
        }
    }

    // Get country by spoken language (Partial Match)
    async getCountryByLanguage(language) {
        try {
            return await this.cacheStoreDAO.getCountryByLanguage(language);
        } catch (error) {
            throw error;
        }
    }

    // Get country by national flag (Exact Match)
    async getCountryByFlag(flagUrl) {
        try {
            return await this.cacheStoreDAO.getCountryByFlag(flagUrl);
        } catch (error) {
            throw error;
        }
    }
}

export default CacheStoreService;
