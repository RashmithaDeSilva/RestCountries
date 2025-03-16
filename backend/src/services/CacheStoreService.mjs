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

    getCountryResponse(countrys) {
        return {
            "countrys_count": countrys.length,
            "countrys": countrys
        }
    }

    // Get all countries
    async getAllCountries() {
        try {
            const countrys = await this.cacheStoreDAO.getAllCountries();
            return this.getCountryResponse(countrys);
        } catch (error) {
            throw error;
        }
    }

    // Get country by name (Partial Match)
    async getCountryByName(name) {
        try {
            const countrys = await this.cacheStoreDAO.getCountryByName(name);
            return this.getCountryResponse(countrys);
        } catch (error) {
            throw error;
        }
    }

    // Get country by currency (Partial Match)
    async getCountryByCurrency(currency) {
        try {
            const countrys = await this.cacheStoreDAO.getCountryByCurrency(currency);
            return this.getCountryResponse(countrys);
        } catch (error) {
            throw error;
        }
    }

    // Get country by capital city (Partial Match)
    async getCountryByCapital(capital) {
        try {
            const countrys = await this.cacheStoreDAO.getCountryByCapital(capital);
            return this.getCountryResponse(countrys);
        } catch (error) {
            throw error;
        }
    }

    // Get country by spoken language (Partial Match)
    async getCountryByLanguage(language) {
        try {
            const countrys = await this.cacheStoreDAO.getCountryByLanguage(language);
            return this.getCountryResponse(countrys);
        } catch (error) {
            throw error;
        }
    }

    // Get country by national flag (Exact Match)
    async getFlagByCountryName(name) {
        try {
            const countrys = await this.cacheStoreDAO.getFlagByCountryName(name);
            return this.getCountryResponse(countrys);
        } catch (error) {
            throw error;
        }
    }

    // Get country by region (Partial Match)
    async getCountryByRegion(region) {
        try {
            const countrys = await this.cacheStoreDAO.getCountryByRegion(region);
            return this.getCountryResponse(countrys);
        } catch (error) {
            throw error;
        }
    }

    // Get country by subregion (Partial Match)
    async getCountryBySubregion(subregion) {
        try {
            const countrys = await this.cacheStoreDAO.getCountryBySubregion(subregion);
            return this.getCountryResponse(countrys);
        } catch (error) {
            throw error;
        }
    }

    // Get country by translation name (Partial Match)
    async getCountryByTranslation(translation) {
        try {
            const countrys = await this.cacheStoreDAO.getCountryByTranslation(translation);
            return this.getCountryResponse(countrys);
        } catch (error) {
            throw error;
        }
    }
}

export default CacheStoreService;
