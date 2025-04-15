import fetch from 'node-fetch';
import CacheStoreErrors from './errors/CacheStoreErrors.mjs';
import CacheStoreService from '../services/CacheStoreService.mjs';
import CacheStoreModel from '../models/CacheStoreModel.mjs';
import ErrorLogService from '../services/ErrorLogService.mjs';
import { LogTypes } from './enums/LogTypes.mjs';
import { log } from './ConsoleLog.mjs';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();
const cacheStoreService = new CacheStoreService();
const errorLogService = new ErrorLogService();

async function allCountries() {
    try {
        // // Fetch the data from the URL
        // const response = await fetch(process.env.DATA_RETRIEVE_API || "https://restcountries.com/v3.1/all");
        // if (!response.ok) {
        //     throw new Error(CacheStoreErrors.FAILED_TO_FETCH_DATA + `(Response status: ${ response.statusText })`);
        // }
        // const data = await response.json();
        // log(LogTypes.INFO, "All countries data fetched successfully");

        // Load data from file
        const fileData = readFileSync(process.env.DATA_RETRIEVE_FILE || './restcountries.com_v3.1_all.json', 'utf-8')
        const data = JSON.parse(fileData);
        
        await cacheStoreService.saveCache(new CacheStoreModel("cache:countries", data));
        log(LogTypes.INFO, "All countries cached save successfully");

    } catch (error) {
        log(LogTypes.ERROR, "All countries fetching or caching data");
        await errorLogService.createLog('CacheStoreController.allCountries', error);
    }
}

async function cacheStoreController() {
    try {
        allCountries()
        setInterval(allCountries, Number(process.env.ALL_COUNTRIES_POLLING_INTERVAL_TIME || 3600) * 1000);

    } catch (error) {
        log(LogTypes.ERROR, error);
    }
}

export default cacheStoreController;
