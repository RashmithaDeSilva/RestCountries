import { Router } from 'express';
import dotenv from 'dotenv';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import isAuthenticated from '../middlewares/ApiKeyAuthMiddleware.mjs';
import CacheStoreService from '../services/CacheStoreService.mjs';
import ErrorLogService from '../services/ErrorLogService.mjs';
import CacheStoreErrors from '../utils/errors/CacheStoreErrors.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';
import RestCountryErrors from '../utils/errors/RestCountryErrors.mjs';
import ApiKeyUsageService from '../services/ApiKeyUsageService.mjs';

dotenv.config();
const router = Router();
const cacheStoreService = new CacheStoreService();
const errorLogService = new ErrorLogService();
const apiKeyUsageService = new ApiKeyUsageService();

/**
 * @swagger
 * /api/v1/auth/restcountry:
 *   get:
 *     summary: "Retrieve all countries"
 *     description: "Fetches a list of countries from cache or an external API if the cache fails."
 *     tags:
 *       - "RestCountry"
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: "Successfully retrieved the list of countries."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rest countries all"
 *                 data:
 *                   type: object
 *                   properties:
 *                     countrys_count:
 *                       type: integer
 *                       example: 20
 *                     countrys:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "United States"
 *                           code:
 *                             type: string
 *                             example: "US"
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       400:
 *         description: "Invalid API key or missing authorization header."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid API key"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       401:
 *         description: "API key is required in the request header."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "API key required"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: {"redirect":"/api/v1/auth"}
 *       500:
 *         description: "Internal server error."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 * components:
 *   securitySchemes:
 *     apiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 */
router.get('/', isAuthenticated, async (req, res) => {
    try {
        await apiKeyUsageService.isUserCanRequest(req.user.id);
        let restCountries;
        
        try {
            // Try to get countries from cache
            restCountries = await cacheStoreService.getAllCountries();

        } catch (cacheError) {
            // Save error on error log
            await errorLogService.createLog('/restcountry/', cacheError);

            // If cache fetch fails, fetch from external API
            const response = await fetch(process.env.DATA_RETRIEVE_API);
            if (!response.ok) {
                throw new Error(`${ CacheStoreErrors.FAILED_TO_FETCH_DATA  } (response status: ${ response.statusText })`);
            }
            restCountries = await response.json();
        }

        return res.status(200).send(StandardResponse(
            true,
            "Rest countries all",
            restCountries,
            null
        ));
        
    } catch (error) {
        return await ErrorResponse(error, res, '/restcountry/');
    }
});

/**
 * @swagger
 * /api/v1/auth/restcountry/name/{name}:
 *   get:
 *     summary: "Retrieve country by name"
 *     description: "Fetches a country by its name from the cache or an external API if the cache fails."
 *     tags:
 *       - "RestCountry"
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: "The name of the country to retrieve."
 *         schema:
 *           type: string
 *           example: "Sri Lanka"
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: "Successfully retrieved the list of countries."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rest countries all"
 *                 data:
 *                   type: object
 *                   properties:
 *                     countrys_count:
 *                       type: integer
 *                       example: 20
 *                     countrys:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "United States"
 *                           code:
 *                             type: string
 *                             example: "US"
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       400:
 *         description: "Invalid API key or missing authorization header."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid API key"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       401:
 *         description: "API key is required in the request header."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "API key required"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: {"redirect":"/api/v1/auth"}
 *       404:
 *         description: "Country not found."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Country not found"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       500:
 *         description: "Internal server error."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 * components:
 *   securitySchemes:
 *     apiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 */
router.get('/name/:name', isAuthenticated, async (req, res) => {
    try {
        await apiKeyUsageService.isUserCanRequest(req.user.id);
        const countryName = req.params.name;
        let restCountries;
        
        try {
            // Try to get countries from cache
            restCountries = await cacheStoreService.getCountryByName(countryName);

            // If no data found in cache, return error
            if (!restCountries || restCountries.length === 0) {
                throw new Error(RestCountryErrors.COUNTRY_NOT_FOUND);
            }

        } catch (cacheError) {
            // Log cache error
            await errorLogService.createLog('/restcountry/name', cacheError);

            // If cache fetch fails, fetch from external API
            const response = await fetch(`${process.env.DATA_RETRIEVE_API}/name/${ encodeURIComponent(countryName) }`);
            if (!response.ok) {
                throw new Error(`${ CacheStoreErrors.FAILED_TO_FETCH_DATA } (response status: ${ response.statusText })`);
            }
            restCountries = await response.json();
        }

        return res.status(200).send(StandardResponse(
            true,
            `Rest country with name: ${ countryName }`,
            restCountries,
            null
        ));
        
    } catch (error) {
        return await ErrorResponse(error, res, '/restcountry/name');
    }
});

/**
 * @swagger
 * /api/v1/auth/restcountry/currency/{name}:
 *   get:
 *     summary: "Retrieve countries by currency"
 *     description: "Fetches a list of countries that use the specified currency from the cache or an external API if the cache fails."
 *     tags:
 *       - "RestCountry"
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: "The currency code (e.g., USD, EUR) to find associated countries."
 *         schema:
 *           type: string
 *           example: "USD"
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: "Successfully retrieved the list of countries."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rest countries all"
 *                 data:
 *                   type: object
 *                   properties:
 *                     countrys_count:
 *                       type: integer
 *                       example: 20
 *                     countrys:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "United States"
 *                           code:
 *                             type: string
 *                             example: "US"
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       400:
 *         description: "Invalid API key or missing authorization header."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid API key"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       401:
 *         description: "API key is required in the request header."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "API key required"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: {"redirect":"/api/v1/auth"}
 *       404:
 *         description: "Country not found."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Country not found"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       500:
 *         description: "Internal server error."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 * components:
 *   securitySchemes:
 *     apiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 */
router.get('/currency/:name', isAuthenticated, async (req, res) => {
    try {
        await apiKeyUsageService.isUserCanRequest(req.user.id);
        const currencyName = req.params.name;
        let restCountries;
        
        try {
            // Try to get countries from cache
            restCountries = await cacheStoreService.getCountryByCurrency(currencyName);

            // If no data found in cache, return error
            if (!restCountries || restCountries.length === 0) {
                throw new Error(RestCountryErrors.COUNTRY_NOT_FOUND);
            }

        } catch (cacheError) {
            // Log cache error
            await errorLogService.createLog('/restcountry/currency', cacheError);

            // If cache fetch fails, fetch from external API
            const response = await fetch(`${process.env.DATA_RETRIEVE_API}/currency/${ encodeURIComponent(currencyName) }`);
            if (!response.ok) {
                throw new Error(`${ CacheStoreErrors.FAILED_TO_FETCH_DATA } (response status: ${ response.statusText })`);
            }
            restCountries = await response.json();
        }

        return res.status(200).send(StandardResponse(
            true,
            `Rest country with currency: ${ currencyName }`,
            restCountries,
            null
        ));
        
    } catch (error) {
        return await ErrorResponse(error, res, '/restcountry/currency');
    }
});

/**
 * @swagger
 * /api/v1/auth/restcountry/capital/{name}:
 *   get:
 *     summary: "Retrieve countries by capital city"
 *     description: "Fetches a list of countries that have the specified capital from the cache or an external API if the cache fails."
 *     tags:
 *       - "RestCountry"
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: "The capital city name to find associated countries."
 *         schema:
 *           type: string
 *           example: "Paris"
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: "Successfully retrieved the list of countries by capital."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rest country with capital: Paris"
 *                 data:
 *                   type: object
 *                   properties:
 *                     countrys_count:
 *                       type: integer
 *                       example: 3
 *                     countrys:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "France"
 *                           code:
 *                             type: string
 *                             example: "FR"
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       400:
 *         description: "Invalid API key or missing authorization header."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid API key"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       401:
 *         description: "API key is required in the request header."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "API key required"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: {"redirect":"/api/v1/auth"}
 *       404:
 *         description: "Country not found."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Country not found"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       500:
 *         description: "Internal server error."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 * components:
 *   securitySchemes:
 *     apiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 */
router.get('/capital/:name', isAuthenticated, async (req, res) => {
    try {
        await apiKeyUsageService.isUserCanRequest(req.user.id);
        const capitalName = req.params.name;
        let restCountries;
        
        try {
            // Try to get countries from cache
            restCountries = await cacheStoreService.getCountryByCapital(capitalName);

            // If no data found in cache, return error
            if (!restCountries || restCountries.length === 0) {
                throw new Error(RestCountryErrors.COUNTRY_NOT_FOUND);
            }

        } catch (cacheError) {
            // Log cache error
            await errorLogService.createLog('/restcountry/capital', cacheError);

            // If cache fetch fails, fetch from external API
            const response = await fetch(`${process.env.DATA_RETRIEVE_API}/capital/${ encodeURIComponent(capitalName) }`);
            if (!response.ok) {
                throw new Error(`${ CacheStoreErrors.FAILED_TO_FETCH_DATA } (response status: ${ response.statusText })`);
            }
            restCountries = await response.json();
        }

        return res.status(200).send(StandardResponse(
            true,
            `Rest country with capital: ${ capitalName }`,
            restCountries,
            null
        ));
        
    } catch (error) {
        return await ErrorResponse(error, res, '/restcountry/capital');
    }
});

/**
 * @swagger
 * /api/v1/auth/restcountry/lang/{name}:
 *   get:
 *     summary: "Retrieve countries by language"
 *     description: "Fetches a list of countries that use the specified language from the cache or an external API if the cache fails."
 *     tags:
 *       - "RestCountry"
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: "The language name to find associated countries."
 *         schema:
 *           type: string
 *           example: "Spanish"
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: "Successfully retrieved the list of countries by language."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rest country with languages: Spanish"
 *                 data:
 *                   type: object
 *                   properties:
 *                     countrys_count:
 *                       type: integer
 *                       example: 21
 *                     countrys:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Spain"
 *                           code:
 *                             type: string
 *                             example: "ES"
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       400:
 *         description: "Invalid API key or missing authorization header."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid API key"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       401:
 *         description: "API key is required in the request header."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "API key required"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: {"redirect":"/api/v1/auth"}
 *       404:
 *         description: "Country not found."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Country not found"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       500:
 *         description: "Internal server error."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 * components:
 *   securitySchemes:
 *     apiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 */
router.get('/lang/:name', isAuthenticated, async (req, res) => {
    try {
        await apiKeyUsageService.isUserCanRequest(req.user.id);
        const langName = req.params.name;
        let restCountries;
        
        try {
            // Try to get countries from cache
            restCountries = await cacheStoreService.getCountryByLanguage(langName);

            // If no data found in cache, return error
            if (!restCountries || restCountries.length === 0) {
                throw new Error(RestCountryErrors.COUNTRY_NOT_FOUND);
            }

        } catch (cacheError) {
            // Log cache error
            await errorLogService.createLog('/restcountry/lang', cacheError);

            // If cache fetch fails, fetch from external API
            const response = await fetch(`${process.env.DATA_RETRIEVE_API}/lang/${ encodeURIComponent(langName) }`);
            if (!response.ok) {
                throw new Error(`${ CacheStoreErrors.FAILED_TO_FETCH_DATA } (response status: ${ response.statusText })`);
            }
            restCountries = await response.json();
        }

        return res.status(200).send(StandardResponse(
            true,
            `Rest country with languages: ${ langName }`,
            restCountries,
            null
        ));
        
    } catch (error) {
        return await ErrorResponse(error, res, '/restcountry/lang');
    }
});

/**
 * @swagger
 * /api/v1/auth/restcountry/flag/{name}:
 *   get:
 *     summary: "Retrieve country flag by country name"
 *     description: "Fetches the flag of a country by its name, using the cache or an external API if the cache fails."
 *     tags:
 *       - "RestCountry"
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: "The country name to retrieve the flag for."
 *         schema:
 *           type: string
 *           example: "United States"
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: "Successfully retrieved the country's flag."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rest country with flag: United States"
 *                 data:
 *                   type: object
 *                   properties:
 *                     country:
 *                       type: string
 *                       example: "United States"
 *                     code:
 *                       type: string
 *                       example: "US"
 *                     flag:
 *                       type: string
 *                       example: "https://flagcdn.com/w320/us.png"
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       400:
 *         description: "Invalid API key or missing authorization header."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid API key"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       401:
 *         description: "API key is required in the request header."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "API key required"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: {"redirect":"/api/v1/auth"}
 *       404:
 *         description: "Country not found."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Country not found"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       500:
 *         description: "Internal server error."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 * components:
 *   securitySchemes:
 *     apiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 */
router.get('/flag/:name', isAuthenticated, async (req, res) => {
    try {
        await apiKeyUsageService.isUserCanRequest(req.user.id);
        const countryName = req.params.name;
        let restCountries;
        
        try {
            // Try to get countries from cache
            restCountries = await cacheStoreService.getFlagByCountryName(countryName);

            // If no data found in cache, return error
            if (!restCountries || restCountries.length === 0) {
                throw new Error(RestCountryErrors.COUNTRY_NOT_FOUND);
            }

        } catch (cacheError) {
            // Log cache error
            await errorLogService.createLog('/restcountry/flag', cacheError);

            // If cache fetch fails, fetch from external API
            const response = await fetch(`${process.env.DATA_RETRIEVE_API}/flag/${ encodeURIComponent(countryName) }`);
            if (!response.ok) {
                throw new Error(`${ CacheStoreErrors.FAILED_TO_FETCH_DATA } (response status: ${ response.statusText })`);
            }
            restCountries = await response.json();
        }

        return res.status(200).send(StandardResponse(
            true,
            `Rest country with flag: ${ countryName }`,
            restCountries,
            null
        ));
        
    } catch (error) {
        return await ErrorResponse(error, res, '/restcountry/flag');
    }
});

/**
 * @swagger
 * /api/v1/auth/restcountry/region/{name}:
 *   get:
 *     summary: "Retrieve countries by region name"
 *     description: "Fetches countries in a specified region by its name, using the cache or an external API if the cache fails."
 *     tags:
 *       - "RestCountry"
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: "The region name to retrieve countries for."
 *         schema:
 *           type: string
 *           example: "Europe"
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: "Successfully retrieved countries in the specified region."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rest country with region: Europe"
 *                 data:
 *                   type: object
 *                   properties:
 *                     region:
 *                       type: string
 *                       example: "Europe"
 *                     countries_count:
 *                       type: integer
 *                       example: 20
 *                     countries:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Germany"
 *                           code:
 *                             type: string
 *                             example: "DE"
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       400:
 *         description: "Invalid API key or missing authorization header."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid API key"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       401:
 *         description: "API key is required in the request header."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "API key required"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: {"redirect":"/api/v1/auth"}
 *       404:
 *         description: "Country not found."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Country not found"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       500:
 *         description: "Internal server error."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 * components:
 *   securitySchemes:
 *     apiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 */
router.get('/region/:name', isAuthenticated, async (req, res) => {
    try {
        await apiKeyUsageService.isUserCanRequest(req.user.id);
        const regionName = req.params.name;
        let restCountries;
        
        try {
            // Try to get countries from cache
            restCountries = await cacheStoreService.getCountryByRegion(regionName);

            // If no data found in cache, return error
            if (!restCountries || restCountries.length === 0) {
                throw new Error(RestCountryErrors.COUNTRY_NOT_FOUND);
            }

        } catch (cacheError) {
            // Log cache error
            await errorLogService.createLog('/restcountry/region', cacheError);

            // If cache fetch fails, fetch from external API
            const response = await fetch(`${process.env.DATA_RETRIEVE_API}/region/${ encodeURIComponent(regionName) }`);
            if (!response.ok) {
                throw new Error(`${ CacheStoreErrors.FAILED_TO_FETCH_DATA } (response status: ${ response.statusText })`);
            }
            restCountries = await response.json();
        }

        return res.status(200).send(StandardResponse(
            true,
            `Rest country with region: ${ regionName }`,
            restCountries,
            null
        ));
        
    } catch (error) {
        return await ErrorResponse(error, res, '/restcountry/region');
    }
});

/**
 * @swagger
 * /api/v1/auth/restcountry/subregions/{name}:
 *   get:
 *     summary: "Retrieve countries by subregion name"
 *     description: "Fetches countries in a specified subregion by its name, using the cache or an external API if the cache fails."
 *     tags:
 *       - "RestCountry"
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: "The subregion name to retrieve countries for."
 *         schema:
 *           type: string
 *           example: "Southern Asia"
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: "Successfully retrieved countries in the specified subregion."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rest country with subregions: Southern Asia"
 *                 data:
 *                   type: object
 *                   properties:
 *                     subregion:
 *                       type: string
 *                       example: "Southern Asia"
 *                     countries_count:
 *                       type: integer
 *                       example: 5
 *                     countries:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "India"
 *                           code:
 *                             type: string
 *                             example: "IN"
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       400:
 *         description: "Invalid API key or missing authorization header."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid API key"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       401:
 *         description: "API key is required in the request header."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "API key required"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: {"redirect":"/api/v1/auth"}
 *       404:
 *         description: "Country not found."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Country not found"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       500:
 *         description: "Internal server error."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 * components:
 *   securitySchemes:
 *     apiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 */
router.get('/subregions/:name', isAuthenticated, async (req, res) => {
    try {
        await apiKeyUsageService.isUserCanRequest(req.user.id);
        const subregionsName = req.params.name;
        let restCountries;
        
        try {
            // Try to get countries from cache
            restCountries = await cacheStoreService.getCountryBySubregion(subregionsName);

            // If no data found in cache, return error
            if (!restCountries || restCountries.length === 0) {
                throw new Error(RestCountryErrors.COUNTRY_NOT_FOUND);
            }

        } catch (cacheError) {
            // Log cache error
            await errorLogService.createLog('/restcountry/subregions', cacheError);

            // If cache fetch fails, fetch from external API
            const response = await fetch(`${process.env.DATA_RETRIEVE_API}/subregions/${ encodeURIComponent(subregionsName) }`);
            if (!response.ok) {
                throw new Error(`${ CacheStoreErrors.FAILED_TO_FETCH_DATA } (response status: ${ response.statusText })`);
            }
            restCountries = await response.json();
        }

        return res.status(200).send(StandardResponse(
            true,
            `Rest country with subregions: ${ subregionsName }`,
            restCountries,
            null
        ));
        
    } catch (error) {
        return await ErrorResponse(error, res, '/restcountry/subregions');
    }
});

/**
 * @swagger
 * /api/v1/auth/restcountry/translation/{name}:
 *   get:
 *     summary: "Retrieve countries by translation name"
 *     description: "Fetches countries in a specified language translation by its name, using the cache or an external API if the cache fails."
 *     tags:
 *       - "RestCountry"
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: "The translation name to retrieve countries for."
 *         schema:
 *           type: string
 *           example: "French"
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: "Successfully retrieved countries in the specified translation."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rest country with translation: French"
 *                 data:
 *                   type: object
 *                   properties:
 *                     translation:
 *                       type: string
 *                       example: "French"
 *                     countries_count:
 *                       type: integer
 *                       example: 10
 *                     countries:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "France"
 *                           code:
 *                             type: string
 *                             example: "FR"
 *                 errors:
 *                   type: "null"
 *                   example: null
 *       400:
 *         description: "Invalid API key or missing authorization header."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid API key"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       401:
 *         description: "API key is required in the request header."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "API key required"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: {"redirect":"/api/v1/auth"}
 *       404:
 *         description: "Country not found."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Country not found"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 *       500:
 *         description: "Internal server error."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 data:
 *                   type: "null"
 *                   example: null
 *                 errors:
 *                   type: string
 *                   example: null
 * components:
 *   securitySchemes:
 *     apiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 */
router.get('/translation/:name', isAuthenticated, async (req, res) => {
    try {
        await apiKeyUsageService.isUserCanRequest(req.user.id);
        const translationName = req.params.name;
        let restCountries;
        
        try {
            // Try to get countries from cache
            restCountries = await cacheStoreService.getCountryByTranslation(translationName);

            // If no data found in cache, return error
            if (!restCountries || restCountries.length === 0) {
                throw new Error(RestCountryErrors.COUNTRY_NOT_FOUND);
            }

        } catch (cacheError) {
            // Log cache error
            await errorLogService.createLog('/restcountry/translation', cacheError);

            // If cache fetch fails, fetch from external API
            const response = await fetch(`${process.env.DATA_RETRIEVE_API}/translation/${ encodeURIComponent(translationName) }`);
            if (!response.ok) {
                throw new Error(`${ CacheStoreErrors.FAILED_TO_FETCH_DATA } (response status: ${ response.statusText })`);
            }
            restCountries = await response.json();
        }

        return res.status(200).send(StandardResponse(
            true,
            `Rest country with translation: ${ translationName }`,
            restCountries,
            null
        ));
        
    } catch (error) {
        return await ErrorResponse(error, res, '/restcountry/translation');
    }
});

export default router;
