import redisClient from '../config/RedisCon.mjs';

class CacheStoreDAO {
    constructor() {}

    // Save data in Redis
    async save(cacheStoreModel) {
        try {
            // Save data in Redis as a simple string
            await redisClient.set(cacheStoreModel.key, JSON.stringify(cacheStoreModel.value));
        } catch (error) {
            throw error;
        }
    }

    // Retrieve all cached countries
    async getAllCountries() {
        try {
            const result = await redisClient.get("cache:countries");
            return result ? JSON.parse(result) : [];
        } catch (error) {
            throw error;
        }
    }

    // Get country using name (Partial Match)
    async getCountryByName(name) {
        try {
            const allCountries = await this.getAllCountries();
            return allCountries.filter(country =>
                country.name.common.toLowerCase().includes(name.toLowerCase())
            );
        } catch (error) {
            throw error;
        }
    }

    // Get country using currency information (Partial Match)
    async getCountryByCurrency(currency) {
        try {
            const allCountries = await this.getAllCountries();
            return allCountries.filter(country =>
                Object.keys(country.currencies || {}).some(curr =>
                    curr.toLowerCase().includes(currency.toLowerCase())
                )
            );
        } catch (error) {
            throw error;
        }
    }

    // Get country using capital city (Partial Match)
    async getCountryByCapital(capital) {
        try {
            const allCountries = await this.getAllCountries();
            return allCountries.filter(country =>
                country.capital && country.capital.some(cap =>
                    cap.toLowerCase().includes(capital.toLowerCase())
                )
            );
        } catch (error) {
            throw error;
        }
    }

    // Get country using spoken languages (Partial Match)
    async getCountryByLanguage(language) {
        try {
            const allCountries = await this.getAllCountries();
            return allCountries.filter(country =>
                Object.values(country.languages || {}).some(lang =>
                    lang.toLowerCase().includes(language.toLowerCase())
                )
            );
        } catch (error) {
            throw error;
        }
    }

    // Get flag using country name
    async getFlagByCountryName(name) {
        try {
            const allCountries = await this.getAllCountries();
            return allCountries
                .filter(country =>
                    country.name.common.toLowerCase().includes(name.toLowerCase())
                )
                .map(country => ({
                    name: country.name.common,
                    flags: country.flags
                }));
        } catch (error) {
            throw error;
        }
    }

    // Get country using region (Partial Match)
    async getCountryByRegion(region) {
        try {
            const allCountries = await this.getAllCountries();
            return allCountries.filter(country =>
                country.region && country.region.toLowerCase().includes(region.toLowerCase())
            );
        } catch (error) {
            throw error;
        }
    }

    // Get country using subregion (Partial Match)
    async getCountryBySubregion(subregion) {
        try {
            const allCountries = await this.getAllCountries();
            return allCountries.filter(country =>
                country.subregion && country.subregion.toLowerCase().includes(subregion.toLowerCase())
            );
        } catch (error) {
            throw error;
        }
    }

    // Get country by translation name (Partial Match)
    async getCountryByTranslation(translation) {
        try {
            const allCountries = await this.getAllCountries();
            return allCountries.filter(country =>
                Object.values(country.translations || {}).some(trans =>
                    trans.common.toLowerCase().includes(translation.toLowerCase())
                )
            );
        } catch (error) {
            throw error;
        }
    }

    // Get online users and admins based on unique sessions
    async getOnlineAdminsAndUsersBySesions() {
        try {
            let cursor = 0;
            const userIds = new Set();
            const adminIds = new Set();

            do {
                const result = await redisClient.scan(cursor, {
                    MATCH: 'session:*',
                    COUNT: 100,
                });

                cursor = Number(result.cursor);

                if (result.keys.length === 0) continue;

                const sessionDataList = await Promise.all(
                    result.keys.map(async (key) => {
                        const keyData = await redisClient.get(key);
                        if (keyData) {
                            const parsed = JSON.parse(keyData);
                            const user = parsed?.passport?.user;
                            if (user?.id && user?.roll) {
                                if (user.roll === "USER") {
                                    userIds.add(user.id); // Add to Set (unique)
                                } else {
                                    adminIds.add(user.id);
                                }
                            }
                        }
                    })
                );

            } while (cursor !== 0);

            return {
                adminsCount: adminIds.size,
                usersCount: userIds.size,
            };

        } catch (error) {
            throw error;
        }
    }
}

export default CacheStoreDAO;
