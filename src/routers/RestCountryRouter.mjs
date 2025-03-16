import { Router } from 'express';
import dotenv from 'dotenv';
import StandardResponse from '../utils/responses/StandardResponse.mjs';
import isAuthenticated from '../middlewares/ApiKeyAuthMiddleware.mjs';
import CacheStoreService from '../services/CacheStoreService.mjs';
import ErrorLogService from '../services/ErrorLogService.mjs';
import CacheStoreErrors from '../utils/errors/CacheStoreErrors.mjs';
import ErrorResponse from '../utils/responses/ErrorResponse.mjs';
import RestCountryErrors from '../utils/errors/RestCountryErrors.mjs';

dotenv.config();
const router = Router();
const cacheStoreService = new CacheStoreService();
const errorLogService = new ErrorLogService();

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

export default router;
