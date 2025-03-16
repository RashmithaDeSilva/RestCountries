import fetch from 'node-fetch';
import redisCacheStore from '../stores/CacheStore.mjs';
import CacheStoreErrors from '../utils/errors/CacheStoreErrors.mjs';

async function allCountries() {
    try {
        // Fetch the data from the URL
        const response = await fetch("https://restcountries.com/v3.1/all");
        if (!response.ok) {
            throw new Error(CacheStoreErrors.FAILED_TO_FETCH_DATA + `(Response status: ${ response.statusText })`);
        }
        const data = await response.json();
        console.log("[INFO] - All Countries data fetched successfully");
        
        await redisCacheStore.set("countries:all", JSON.stringify(data));

        console.log("[INFO] - All Countries cached save successfully");

    } catch (error) {
        console.error("[ERROR] - Error fetching or caching data:", error);
    }
}

async function cacheStoreController() {
    try {
        allCountries()
        setInterval(allCountries, 60 * 60 * 1000);

    } catch (error) {
        console.log(error);
    }
}

export default cacheStoreController;
